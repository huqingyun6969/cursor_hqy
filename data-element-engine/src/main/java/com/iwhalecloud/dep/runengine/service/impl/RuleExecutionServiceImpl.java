package com.iwhalecloud.dep.runengine.service.impl;

import com.iwhalecloud.dep.runengine.domain.entity.*;
import com.iwhalecloud.dep.runengine.domain.enums.RuleType;
import com.iwhalecloud.dep.runengine.domain.vo.ExecutionResultVO;
import com.iwhalecloud.dep.runengine.liteflow.context.RuleContext;
import com.iwhalecloud.dep.runengine.mapper.ExecutionDetailMapper;
import com.iwhalecloud.dep.runengine.mapper.ExecutionRecordMapper;
import com.iwhalecloud.dep.runengine.service.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yomahub.liteflow.core.FlowExecutor;
import com.yomahub.liteflow.flow.LiteflowResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RuleExecutionServiceImpl implements RuleExecutionService {

    private static final Logger log = LoggerFactory.getLogger(RuleExecutionServiceImpl.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final RuleGroupService ruleGroupService;
    private final RuleDefinitionService ruleDefinitionService;
    private final DataSourceConfigService dataSourceConfigService;
    private final DictService dictService;
    private final FlowExecutor flowExecutor;
    private final ExecutionRecordMapper executionRecordMapper;
    private final ExecutionDetailMapper executionDetailMapper;

    public RuleExecutionServiceImpl(RuleGroupService ruleGroupService,
                                     RuleDefinitionService ruleDefinitionService,
                                     DataSourceConfigService dataSourceConfigService,
                                     DictService dictService,
                                     FlowExecutor flowExecutor,
                                     ExecutionRecordMapper executionRecordMapper,
                                     ExecutionDetailMapper executionDetailMapper) {
        this.ruleGroupService = ruleGroupService;
        this.ruleDefinitionService = ruleDefinitionService;
        this.dataSourceConfigService = dataSourceConfigService;
        this.dictService = dictService;
        this.flowExecutor = flowExecutor;
        this.executionRecordMapper = executionRecordMapper;
        this.executionDetailMapper = executionDetailMapper;
    }

    @Override
    public ExecutionResultVO executeRuleGroup(Long ruleGroupId) {
        RuleGroup group = ruleGroupService.getById(ruleGroupId);
        if (group == null) {
            throw new RuntimeException("Rule group not found: " + ruleGroupId);
        }

        DataSourceConfig ds = dataSourceConfigService.getById(group.getDataSourceId());
        if (ds == null) {
            throw new RuntimeException("Data source not found: " + group.getDataSourceId());
        }

        List<RuleDefinition> rules = ruleDefinitionService.getByGroupId(ruleGroupId);
        if (rules.isEmpty()) {
            throw new RuntimeException("No rules defined for group: " + ruleGroupId);
        }

        ExecutionRecord record = new ExecutionRecord();
        record.setRuleGroupId(ruleGroupId);
        record.setRuleGroupName(group.getName());
        record.setTotalRules(rules.size());
        record.setStatus("RUNNING");
        record.setStartTime(LocalDateTime.now());
        executionRecordMapper.insert(record);

        long startTime = System.currentTimeMillis();

        try {
            List<Map<String, Object>> dataRows = fetchData(ds, group);
            long totalRows = dataRows.size();
            record.setTotalRows(totalRows);

            List<ExecutionResultVO.RuleResultVO> details = new ArrayList<>();
            int passedRules = 0;
            int failedRules = 0;

            for (RuleDefinition rule : rules) {
                long ruleStart = System.currentTimeMillis();
                String componentId = getComponentId(rule.getRuleType());

                RuleContext ruleContext = new RuleContext();
                ruleContext.setCurrentRule(rule);
                ruleContext.setDataRows(dataRows);
                ruleContext.setTotalRows(totalRows);

                if (RuleType.DOMAIN_CHECK.name().equals(rule.getRuleType())) {
                    loadDictValues(rule, ruleContext);
                }

                String chainEl = "THEN(" + componentId + ");";
                try {
                    LiteflowResponse response = flowExecutor.execute2RespWithEL(
                            chainEl,
                            null,
                            null,
                            ruleContext
                    );
                    if (!response.isSuccess()) {
                        log.error("Rule execution failed for rule {}: {}", rule.getId(), response.getCause());
                    }
                } catch (Exception e) {
                    log.error("Error executing rule {}: {}", rule.getId(), e.getMessage(), e);
                    ruleContext.setViolatedRows(0);
                    ruleContext.addViolation("Execution error: " + e.getMessage());
                }

                long violatedRows = ruleContext.getViolatedRows();
                BigDecimal complianceRate = totalRows > 0
                        ? BigDecimal.valueOf((totalRows - violatedRows) * 100.0 / totalRows)
                        .setScale(2, RoundingMode.HALF_UP)
                        : BigDecimal.valueOf(100);

                String qualityResult = violatedRows == 0 ? "PASS" : "FAIL";
                if ("PASS".equals(qualityResult)) {
                    passedRules++;
                } else {
                    failedRules++;
                }

                ExecutionDetail detail = new ExecutionDetail();
                detail.setExecutionId(record.getId());
                detail.setRuleId(rule.getId());
                detail.setFieldName(rule.getFieldName());
                detail.setRuleType(rule.getRuleType());
                detail.setRuleDescription(rule.getDescription());
                detail.setTotalRows(totalRows);
                detail.setViolatedRows(violatedRows);
                detail.setComplianceRate(complianceRate);
                detail.setQualityResult(qualityResult);
                detail.setDurationMs(System.currentTimeMillis() - ruleStart);
                if (!ruleContext.getSampleViolations().isEmpty()) {
                    detail.setSampleViolations(MAPPER.writeValueAsString(ruleContext.getSampleViolations()));
                }
                executionDetailMapper.insert(detail);

                ExecutionResultVO.RuleResultVO rvo = new ExecutionResultVO.RuleResultVO();
                rvo.setFieldName(rule.getFieldName());
                rvo.setRuleType(rule.getRuleType());
                rvo.setRuleDescription(rule.getDescription());
                rvo.setTotalRows(totalRows);
                rvo.setViolatedRows(violatedRows);
                rvo.setComplianceRate(complianceRate);
                rvo.setQualityResult(qualityResult);
                rvo.setSampleViolations(ruleContext.getSampleViolations());
                details.add(rvo);
            }

            long duration = System.currentTimeMillis() - startTime;
            record.setPassedRules(passedRules);
            record.setFailedRules(failedRules);
            record.setStatus("COMPLETED");
            record.setEndTime(LocalDateTime.now());
            record.setDurationMs(duration);
            executionRecordMapper.updateById(record);

            ExecutionResultVO result = new ExecutionResultVO();
            result.setExecutionId(record.getId());
            result.setRuleGroupName(group.getName());
            result.setTotalRows(totalRows);
            result.setTotalRules(rules.size());
            result.setPassedRules(passedRules);
            result.setFailedRules(failedRules);
            result.setStatus("COMPLETED");
            result.setDurationMs(duration);
            result.setDetails(details);
            return result;

        } catch (Exception e) {
            log.error("Rule group execution failed: {}", e.getMessage(), e);
            record.setStatus("FAILED");
            record.setEndTime(LocalDateTime.now());
            record.setDurationMs(System.currentTimeMillis() - startTime);
            executionRecordMapper.updateById(record);
            throw new RuntimeException("Execution failed: " + e.getMessage(), e);
        }
    }

    private List<Map<String, Object>> fetchData(DataSourceConfig ds, RuleGroup group) {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setUrl(ds.getDbUrl());
        dataSource.setUsername(ds.getDbUsername());
        dataSource.setPassword(ds.getDbPassword());
        dataSource.setDriverClassName(detectDriverClass(ds.getDbUrl()));

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String sql = group.getQuerySql();
        if (sql == null || sql.trim().isEmpty()) {
            sql = "SELECT * FROM " + group.getTableName();
        }
        return jdbc.queryForList(sql);
    }

    private String detectDriverClass(String jdbcUrl) {
        if (jdbcUrl == null) {
            throw new RuntimeException("JDBC URL cannot be null");
        }
        String url = jdbcUrl.toLowerCase();
        if (url.startsWith("jdbc:mysql:")) {
            return "com.mysql.cj.jdbc.Driver";
        } else if (url.startsWith("jdbc:oracle:")) {
            return "oracle.jdbc.OracleDriver";
        } else if (url.startsWith("jdbc:hive2:")) {
            return "org.apache.hive.jdbc.HiveDriver";
        } else if (url.startsWith("jdbc:postgresql:")) {
            return "org.postgresql.Driver";
        } else {
            throw new RuntimeException("Unsupported JDBC URL: " + jdbcUrl
                    + ". Supported: mysql, oracle, hive2, postgresql");
        }
    }

    private void loadDictValues(RuleDefinition rule, RuleContext ctx) {
        try {
            if (rule.getRuleParams() != null) {
                JsonNode params = MAPPER.readTree(rule.getRuleParams());
                if (params.has("dictCode")) {
                    String dictCode = params.get("dictCode").asText();
                    ctx.setDictValues(dictService.getValuesByCode(dictCode));
                }
            }
        } catch (Exception e) {
            log.warn("Failed to load dict values for rule {}: {}", rule.getId(), e.getMessage());
        }
    }

    private String getComponentId(String ruleType) {
        return switch (ruleType) {
            case "NOT_NULL" -> "notNull";
            case "IS_NULL" -> "isNull";
            case "UNIQUE" -> "unique";
            case "LENGTH" -> "length";
            case "REGEX" -> "regex";
            case "DATE_FORMAT" -> "dateFormat";
            case "ID_CARD" -> "idCard";
            case "PHONE" -> "phone";
            case "DOMAIN_CHECK" -> "domainCheck";
            case "TABLE_ROW_COUNT" -> "tableRowCount";
            case "ENCODING_RULE" -> "encodingRule";
            case "INVALID_CONTENT" -> "invalidContent";
            case "FAX" -> "fax";
            case "POSTCODE" -> "postcode";
            case "LANDLINE" -> "landline";
            case "SOCIAL_CREDIT_CODE" -> "socialCreditCode";
            case "DATE_RANGE" -> "dateRange";
            case "SCRIPT" -> "script";
            default -> throw new RuntimeException("Unknown rule type: " + ruleType);
        };
    }
}

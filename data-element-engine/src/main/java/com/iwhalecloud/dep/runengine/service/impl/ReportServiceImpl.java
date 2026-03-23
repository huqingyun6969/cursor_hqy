package com.iwhalecloud.dep.runengine.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iwhalecloud.dep.runengine.domain.entity.*;
import com.iwhalecloud.dep.runengine.domain.vo.ExecutionResultVO;
import com.iwhalecloud.dep.runengine.domain.vo.QualityReportVO;
import com.iwhalecloud.dep.runengine.mapper.ExecutionDetailMapper;
import com.iwhalecloud.dep.runengine.mapper.QualityReportMapper;
import com.iwhalecloud.dep.runengine.service.ReportService;
import com.iwhalecloud.dep.runengine.service.RuleDefinitionService;
import com.iwhalecloud.dep.runengine.service.RuleExecutionService;
import com.iwhalecloud.dep.runengine.service.RuleGroupService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportServiceImpl.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final RuleExecutionService ruleExecutionService;
    private final RuleGroupService ruleGroupService;
    private final RuleDefinitionService ruleDefinitionService;
    private final QualityReportMapper reportMapper;
    private final ExecutionDetailMapper executionDetailMapper;

    public ReportServiceImpl(RuleExecutionService ruleExecutionService,
                              RuleGroupService ruleGroupService,
                              RuleDefinitionService ruleDefinitionService,
                              QualityReportMapper reportMapper,
                              ExecutionDetailMapper executionDetailMapper) {
        this.ruleExecutionService = ruleExecutionService;
        this.ruleGroupService = ruleGroupService;
        this.ruleDefinitionService = ruleDefinitionService;
        this.reportMapper = reportMapper;
        this.executionDetailMapper = executionDetailMapper;
    }

    @Override
    public QualityReportVO generateReport(Long ruleGroupId) {
        ExecutionResultVO execResult = ruleExecutionService.executeRuleGroup(ruleGroupId);
        RuleGroup group = ruleGroupService.getById(ruleGroupId);
        List<RuleDefinition> rules = ruleDefinitionService.getByGroupId(ruleGroupId);

        Map<Long, RuleDefinition> ruleMap = new HashMap<>();
        for (RuleDefinition r : rules) {
            ruleMap.put(r.getId(), r);
        }

        List<ExecutionDetail> details = executionDetailMapper.selectList(
                new LambdaQueryWrapper<ExecutionDetail>()
                        .eq(ExecutionDetail::getExecutionId, execResult.getExecutionId()));

        int totalWeight = 0;
        BigDecimal weightedSum = BigDecimal.ZERO;
        List<QualityReportVO.RuleScoreDetail> ruleDetails = new ArrayList<>();
        StringBuilder formulaParts = new StringBuilder();

        for (int i = 0; i < execResult.getDetails().size(); i++) {
            ExecutionResultVO.RuleResultVO d = execResult.getDetails().get(i);

            String importanceLevel = "NORMAL";
            int weight = 1;
            String ruleLevel = "FIELD";
            RuleDefinition matchedRule = null;

            for (RuleDefinition r : rules) {
                if (r.getFieldName().equals(d.getFieldName())
                        && r.getRuleType().equals(d.getRuleType())) {
                    matchedRule = r;
                    break;
                }
            }

            if (matchedRule != null) {
                importanceLevel = matchedRule.getImportanceLevel() != null ? matchedRule.getImportanceLevel() : "NORMAL";
                weight = matchedRule.getRuleWeight() != null ? matchedRule.getRuleWeight() : ("IMPORTANT".equals(importanceLevel) ? 3 : 1);
                ruleLevel = matchedRule.getRuleLevel() != null ? matchedRule.getRuleLevel() : "FIELD";
            }

            totalWeight += weight;

            BigDecimal ruleScore = d.getComplianceRate() != null ? d.getComplianceRate() : BigDecimal.ZERO;

            QualityReportVO.RuleScoreDetail detail = new QualityReportVO.RuleScoreDetail();
            detail.setRuleType(d.getRuleType());
            detail.setRuleLevel(ruleLevel);
            detail.setFieldName(d.getFieldName());
            detail.setFieldLabel(d.getFieldName());
            detail.setImportanceLevel(importanceLevel);
            detail.setRuleWeight(weight);
            detail.setRuleScore(ruleScore);
            detail.setTotalRows(d.getTotalRows());
            detail.setViolatedRows(d.getViolatedRows());
            detail.setComplianceRate(d.getComplianceRate());
            detail.setQualityResult(d.getQualityResult());
            detail.setDescription(d.getRuleDescription());
            ruleDetails.add(detail);

            weightedSum = weightedSum.add(ruleScore.multiply(BigDecimal.valueOf(weight)));

            if (i > 0) formulaParts.append(" + ");
            formulaParts.append(ruleScore).append(" × (").append(weight).append("/TOTAL_W)");
        }

        BigDecimal totalScore = totalWeight > 0
                ? weightedSum.divide(BigDecimal.valueOf(totalWeight), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String scoreLevel = getScoreLevel(totalScore);

        String formula = formulaParts.toString().replace("TOTAL_W", String.valueOf(totalWeight))
                + " = " + totalScore;

        QualityReport report = new QualityReport();
        report.setRuleGroupId(ruleGroupId);
        report.setTableName(group != null ? group.getName() : "");
        report.setTableLabel(group != null ? group.getDescription() : "");
        report.setTotalScore(totalScore);
        report.setScoreLevel(scoreLevel);
        report.setTotalRows(execResult.getTotalRows());
        report.setTotalRules(execResult.getTotalRules());
        report.setPassedRules(execResult.getPassedRules());
        report.setFailedRules(execResult.getFailedRules());
        report.setExecutionId(execResult.getExecutionId());
        try {
            report.setReportData(MAPPER.writeValueAsString(ruleDetails));
        } catch (Exception e) {
            log.warn("Failed to serialize report data", e);
        }
        reportMapper.insert(report);

        QualityReportVO vo = new QualityReportVO();
        vo.setReportId(report.getId());
        vo.setTableName(report.getTableName());
        vo.setTableLabel(report.getTableLabel());
        vo.setTotalScore(totalScore);
        vo.setScoreLevel(scoreLevel);
        vo.setTotalRows(execResult.getTotalRows());
        vo.setTotalRules(execResult.getTotalRules());
        vo.setPassedRules(execResult.getPassedRules());
        vo.setFailedRules(execResult.getFailedRules());
        vo.setRuleDetails(ruleDetails);
        vo.setScoreFormula(formula);
        if (report.getCreatedAt() != null) {
            vo.setCreatedAt(report.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        return vo;
    }

    @Override
    public QualityReportVO getReport(Long reportId) {
        QualityReport report = reportMapper.selectById(reportId);
        if (report == null) throw new RuntimeException("Report not found: " + reportId);

        QualityReportVO vo = new QualityReportVO();
        vo.setReportId(report.getId());
        vo.setTableName(report.getTableName());
        vo.setTableLabel(report.getTableLabel());
        vo.setTotalScore(report.getTotalScore());
        vo.setScoreLevel(report.getScoreLevel());
        vo.setTotalRows(report.getTotalRows());
        vo.setTotalRules(report.getTotalRules());
        vo.setPassedRules(report.getPassedRules());
        vo.setFailedRules(report.getFailedRules());
        if (report.getCreatedAt() != null) {
            vo.setCreatedAt(report.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        try {
            if (report.getReportData() != null) {
                vo.setRuleDetails(MAPPER.readValue(report.getReportData(),
                        MAPPER.getTypeFactory().constructCollectionType(List.class, QualityReportVO.RuleScoreDetail.class)));
            }
        } catch (Exception e) {
            log.warn("Failed to deserialize report data", e);
        }
        return vo;
    }

    @Override
    public List<QualityReport> listReports() {
        return reportMapper.selectList(new LambdaQueryWrapper<QualityReport>()
                .orderByDesc(QualityReport::getCreatedAt)
                .last("LIMIT 100"));
    }

    private String getScoreLevel(BigDecimal score) {
        if (score.compareTo(BigDecimal.valueOf(90)) >= 0) return "excellent";
        if (score.compareTo(BigDecimal.valueOf(80)) >= 0) return "good";
        if (score.compareTo(BigDecimal.valueOf(60)) >= 0) return "medium";
        return "poor";
    }
}

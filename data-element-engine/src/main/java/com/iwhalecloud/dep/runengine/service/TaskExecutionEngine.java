package com.iwhalecloud.dep.runengine.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iwhalecloud.dep.runengine.domain.dto.TaskCreateDTO;
import com.iwhalecloud.dep.runengine.domain.entity.*;
import com.iwhalecloud.dep.runengine.domain.enums.RuleType;
import com.iwhalecloud.dep.runengine.domain.vo.ExecutionResultVO;
import com.iwhalecloud.dep.runengine.liteflow.context.RuleContext;
import com.iwhalecloud.dep.runengine.mapper.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yomahub.liteflow.builder.el.LiteFlowChainELBuilder;
import com.yomahub.liteflow.core.FlowExecutor;
import com.yomahub.liteflow.flow.LiteflowResponse;
import com.yomahub.liteflow.script.ScriptExecuteWrap;
import com.yomahub.liteflow.builder.LiteFlowNodeBuilder;
import com.yomahub.liteflow.enums.NodeTypeEnum;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TaskExecutionEngine {

    private static final Logger log = LoggerFactory.getLogger(TaskExecutionEngine.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Value("${engine.max-concurrent-tasks:10}")
    private int maxConcurrentTasks;

    @Value("${engine.queue-capacity:100}")
    private int queueCapacity;

    @Value("${engine.cpu-threshold:80}")
    private int cpuThreshold;

    @Value("${engine.memory-threshold:80}")
    private int memoryThreshold;

    @Value("${engine.default-batch-size:10000}")
    private int defaultBatchSize;

    @Value("${engine.default-max-concurrent-subtasks:10}")
    private int defaultMaxConcurrentSubTasks;

    @Value("${engine.default-subtask-timeout-sec:60}")
    private int defaultSubTaskTimeoutSec;

    private final ExecutionTaskMapper taskMapper;
    private final ExecutionSubTaskMapper subTaskMapper;
    private final ExecutionStepLogMapper stepLogMapper;
    private final ExecutionRecordMapper executionRecordMapper;
    private final ExecutionDetailMapper executionDetailMapper;
    private final ExecutionViolationMapper violationMapper;
    private final RuleGroupService ruleGroupService;
    private final RuleDefinitionService ruleDefinitionService;
    private final DataSourceConfigService dataSourceConfigService;
    private final DataSourcePoolManager poolManager;
    private final ResourceMonitorService resourceMonitor;
    private final DictService dictService;
    private final FlowExecutor flowExecutor;

    private ThreadPoolExecutor mainExecutor;
    private final Map<Long, Future<?>> runningMainTasks = new ConcurrentHashMap<>();
    private final Map<Long, AtomicBoolean> cancelFlags = new ConcurrentHashMap<>();
    private ScheduledExecutorService monitor;

    public TaskExecutionEngine(ExecutionTaskMapper taskMapper,
                                ExecutionSubTaskMapper subTaskMapper,
                                ExecutionStepLogMapper stepLogMapper,
                                ExecutionRecordMapper executionRecordMapper,
                                ExecutionDetailMapper executionDetailMapper,
                                ExecutionViolationMapper violationMapper,
                                RuleGroupService ruleGroupService,
                                RuleDefinitionService ruleDefinitionService,
                                DataSourceConfigService dataSourceConfigService,
                                DataSourcePoolManager poolManager,
                                ResourceMonitorService resourceMonitor,
                                DictService dictService,
                                FlowExecutor flowExecutor) {
        this.taskMapper = taskMapper;
        this.subTaskMapper = subTaskMapper;
        this.stepLogMapper = stepLogMapper;
        this.executionRecordMapper = executionRecordMapper;
        this.executionDetailMapper = executionDetailMapper;
        this.violationMapper = violationMapper;
        this.ruleGroupService = ruleGroupService;
        this.ruleDefinitionService = ruleDefinitionService;
        this.dataSourceConfigService = dataSourceConfigService;
        this.poolManager = poolManager;
        this.resourceMonitor = resourceMonitor;
        this.dictService = dictService;
        this.flowExecutor = flowExecutor;
    }

    @PostConstruct
    public void init() {
        BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>(queueCapacity);
        mainExecutor = new ThreadPoolExecutor(
                2, maxConcurrentTasks, 60, TimeUnit.SECONDS, queue,
                new ThreadPoolExecutor.CallerRunsPolicy()
        );
        monitor = Executors.newScheduledThreadPool(1);
        monitor.scheduleAtFixedRate(this::logResourceUsage, 30, 30, TimeUnit.SECONDS);
        log.info("TaskExecutionEngine initialized: maxConcurrent={}, queueCapacity={}, defaultBatch={}, cpuThreshold={}%, memThreshold={}%",
                maxConcurrentTasks, queueCapacity, defaultBatchSize, cpuThreshold, memoryThreshold);
    }

    @PreDestroy
    public void shutdown() {
        mainExecutor.shutdownNow();
        monitor.shutdownNow();
    }

    public ExecutionTask submitTask(TaskCreateDTO dto) {
        RuleGroup group = ruleGroupService.getById(dto.getRuleGroupId());
        if (group == null) throw new RuntimeException("Rule group not found: " + dto.getRuleGroupId());

        Long dsId = dto.getDataSourceId() != null ? dto.getDataSourceId() : group.getDataSourceId();
        DataSourceConfig ds = dataSourceConfigService.getById(dsId);
        if (ds == null) throw new RuntimeException("Data source not found: " + dsId);

        List<RuleDefinition> rules = ruleDefinitionService.getByGroupId(dto.getRuleGroupId());
        if (rules.isEmpty()) throw new RuntimeException("No rules defined for group: " + dto.getRuleGroupId());

        int batchSize = dto.getBatchSize() != null && dto.getBatchSize() > 0 ? dto.getBatchSize() : defaultBatchSize;
        int maxConcSub = dto.getMaxConcurrentSubTasks() != null && dto.getMaxConcurrentSubTasks() > 0
                ? dto.getMaxConcurrentSubTasks() : defaultMaxConcurrentSubTasks;
        int subTimeout = dto.getMaxSubTaskTimeoutSec() != null && dto.getMaxSubTaskTimeoutSec() > 0
                ? dto.getMaxSubTaskTimeoutSec() : defaultSubTaskTimeoutSec;

        ExecutionTask task = new ExecutionTask();
        task.setRuleGroupId(dto.getRuleGroupId());
        task.setRuleGroupName(group.getName());
        task.setDataSourceId(dsId);
        task.setTableName(dto.getTableName() != null ? dto.getTableName() : group.getTableName());
        task.setStatus("QUEUED");
        task.setPriority(5);
        task.setTotalRules(rules.size());
        task.setCompletedRules(0);
        task.setCompletedSubTasks(0);
        task.setProgress(0);
        task.setBatchSize(batchSize);
        task.setMaxConcurrentSubTasks(maxConcSub);
        task.setMaxSubTaskTimeoutSec(subTimeout);
        String fields = dto.getSpecifiedFields();
        if ((fields == null || fields.isEmpty()) && group.getSpecifiedFields() != null && !group.getSpecifiedFields().isEmpty()) {
            fields = group.getSpecifiedFields();
        }
        task.setSpecifiedFields(fields);
        task.setTimeFilterField(dto.getTimeFilterField());
        task.setTimeRangeStart(dto.getTimeRangeStart());
        task.setTimeRangeEnd(dto.getTimeRangeEnd());
        task.setPrimaryKeyField(dto.getPrimaryKeyField());
        task.setRowLimit(dto.getRowLimit());
        task.setPowerjobInstanceId(dto.getPowerjobInstanceId());
        task.setCronExpression(dto.getCronExpression());
        task.setQueuedAt(LocalDateTime.now());
        task.setCreatedBy(dto.getCreatedBy());
        taskMapper.insert(task);

        AtomicBoolean cancelFlag = new AtomicBoolean(false);
        cancelFlags.put(task.getId(), cancelFlag);

        Future<?> future = mainExecutor.submit(() -> executeMainTask(task.getId()));
        runningMainTasks.put(task.getId(), future);
        log.info("Task {} submitted for rule group {} (queue size: {})", task.getId(), dto.getRuleGroupId(), mainExecutor.getQueue().size());
        return taskMapper.selectById(task.getId());
    }

    private void executeMainTask(Long taskId) {
        ExecutionTask task = taskMapper.selectById(taskId);
        if (task == null) return;

        AtomicBoolean cancelFlag = cancelFlags.getOrDefault(taskId, new AtomicBoolean(false));

        if (resourceMonitor.isOverloaded(cpuThreshold, memoryThreshold)) {
            log.warn("System overloaded, delaying task {}", taskId);
            try { Thread.sleep(5000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }

        task.setStatus("RUNNING");
        task.setStartedAt(LocalDateTime.now());
        task.setThreadName(Thread.currentThread().getName());
        taskMapper.updateById(task);

        DataSourceConfig ds = dataSourceConfigService.getById(task.getDataSourceId());
        if (ds == null) { failTask(task, "Data source not found"); return; }

        List<RuleDefinition> rules = ruleDefinitionService.getByGroupId(task.getRuleGroupId());
        if (rules.isEmpty()) { failTask(task, "No rules found"); return; }

        long startTime = System.currentTimeMillis();

        try {
            JdbcTemplate jdbc = poolManager.getJdbcTemplate(ds);

            long totalRows = countRows(jdbc, task, ds);
            task.setTotalRows(totalRows);

            int batchSize = task.getBatchSize() != null ? task.getBatchSize() : defaultBatchSize;
            Long rowLimit = task.getRowLimit();
            long effectiveTotal = rowLimit != null && rowLimit > 0 ? Math.min(totalRows, rowLimit) : totalRows;

            int subTaskCount;
            if (effectiveTotal <= batchSize) {
                subTaskCount = 1;
            } else {
                subTaskCount = (int) Math.ceil((double) effectiveTotal / batchSize);
            }
            task.setSubTaskCount(subTaskCount);
            taskMapper.updateById(task);

            ExecutionRecord record = new ExecutionRecord();
            record.setRuleGroupId(task.getRuleGroupId());
            record.setRuleGroupName(task.getRuleGroupName());
            record.setTotalRules(rules.size());
            record.setTotalRows(effectiveTotal);
            record.setStatus("RUNNING");
            record.setStartTime(LocalDateTime.now());
            executionRecordMapper.insert(record);
            task.setExecutionId(record.getId());
            taskMapper.updateById(task);

            List<ExecutionSubTask> subTasks = new ArrayList<>();
            for (int i = 0; i < subTaskCount; i++) {
                long offsetStart = (long) i * batchSize;
                long offsetEnd = Math.min(offsetStart + batchSize, effectiveTotal);

                ExecutionSubTask sub = new ExecutionSubTask();
                sub.setTaskId(taskId);
                sub.setSubTaskIndex(i + 1);
                sub.setStatus("QUEUED");
                sub.setOffsetStart(offsetStart);
                sub.setOffsetEnd(offsetEnd);
                sub.setTotalRules(rules.size());
                sub.setProcessedRules(0);
                sub.setViolatedCount(0L);
                sub.setPassedCount(0L);
                subTaskMapper.insert(sub);
                subTasks.add(sub);
            }

            int maxConc = task.getMaxConcurrentSubTasks() != null ? task.getMaxConcurrentSubTasks() : defaultMaxConcurrentSubTasks;
            int timeout = task.getMaxSubTaskTimeoutSec() != null ? task.getMaxSubTaskTimeoutSec() : defaultSubTaskTimeoutSec;

            ExecutorService subExecutor = Executors.newFixedThreadPool(Math.min(maxConc, subTaskCount));

            AtomicInteger completedSubs = new AtomicInteger(0);
            AtomicLong totalViolated = new AtomicLong(0);
            AtomicLong totalPassed = new AtomicLong(0);

            Map<String, AtomicLong> fieldViolatedMap = new ConcurrentHashMap<>();
            Map<String, AtomicLong> fieldTotalMap = new ConcurrentHashMap<>();

            List<Future<?>> subFutures = new ArrayList<>();
            for (ExecutionSubTask sub : subTasks) {
                if (cancelFlag.get()) break;
                Future<?> sf = subExecutor.submit(() -> {
                    try {
                        executeSubTask(sub, task, ds, rules, jdbc, cancelFlag, timeout,
                                fieldViolatedMap, fieldTotalMap, totalViolated, totalPassed);
                    } finally {
                        int completed = completedSubs.incrementAndGet();
                        task.setCompletedSubTasks(completed);
                        task.setProgress((int) (completed * 100.0 / subTaskCount));
                        task.setCurrentStep("子任务 " + completed + "/" + subTaskCount);
                        taskMapper.updateById(task);
                    }
                });
                subFutures.add(sf);
            }

            for (Future<?> sf : subFutures) {
                try { sf.get(timeout + 30, TimeUnit.SECONDS); }
                catch (TimeoutException e) { log.warn("Sub-task timed out for task {}", taskId); }
                catch (Exception e) { log.error("Sub-task error for task {}: {}", taskId, e.getMessage()); }
            }
            subExecutor.shutdown();

            if (cancelFlag.get()) {
                task.setStatus("CANCELLED");
                task.setCurrentStep("已取消");
                record.setStatus("CANCELLED");
            } else {
                int passedRules = 0;
                int failedRules = 0;
                for (RuleDefinition rule : rules) {
                    String key = rule.getId() + "_" + rule.getFieldName() + "_" + rule.getRuleType();
                    long violated = fieldViolatedMap.getOrDefault(key, new AtomicLong(0)).get();
                    long total = fieldTotalMap.getOrDefault(key, new AtomicLong(effectiveTotal)).get();

                    BigDecimal complianceRate = total > 0
                            ? BigDecimal.valueOf((total - violated) * 100.0 / total).setScale(2, RoundingMode.HALF_UP)
                            : BigDecimal.valueOf(100);
                    String qualityResult = violated == 0 ? "PASS" : "FAIL";

                    if ("PASS".equals(qualityResult)) passedRules++;
                    else failedRules++;

                    ExecutionDetail detail = new ExecutionDetail();
                    detail.setExecutionId(record.getId());
                    detail.setRuleId(rule.getId());
                    detail.setFieldName(rule.getFieldName());
                    detail.setRuleType(rule.getRuleType());
                    detail.setRuleDescription(rule.getDescription());
                    detail.setTotalRows(total);
                    detail.setViolatedRows(violated);
                    detail.setComplianceRate(complianceRate);
                    detail.setQualityResult(qualityResult);
                    executionDetailMapper.insert(detail);
                }

                record.setPassedRules(passedRules);
                record.setFailedRules(failedRules);
                record.setStatus("COMPLETED");
                task.setStatus("COMPLETED");
                task.setProgress(100);
                task.setCompletedRules(rules.size());
                task.setCurrentStep("全部完成");
            }

            long duration = System.currentTimeMillis() - startTime;
            record.setEndTime(LocalDateTime.now());
            record.setDurationMs(duration);
            executionRecordMapper.updateById(record);

            task.setFinishedAt(LocalDateTime.now());
            task.setDurationMs(duration);
            task.setCpuUsagePct(resourceMonitor.getCpuUsage());
            task.setMemoryUsageMb(resourceMonitor.getUsedMemoryMb());
            taskMapper.updateById(task);

        } catch (Exception e) {
            log.error("Main task {} failed: {}", taskId, e.getMessage(), e);
            failTask(task, e.getMessage());
        } finally {
            runningMainTasks.remove(taskId);
            cancelFlags.remove(taskId);
        }
    }

    private void executeSubTask(ExecutionSubTask sub, ExecutionTask task, DataSourceConfig ds,
                                 List<RuleDefinition> rules, JdbcTemplate jdbc,
                                 AtomicBoolean cancelFlag, int timeoutSec,
                                 Map<String, AtomicLong> fieldViolatedMap,
                                 Map<String, AtomicLong> fieldTotalMap,
                                 AtomicLong totalViolated, AtomicLong totalPassed) {
        sub.setStatus("RUNNING");
        sub.setStartedAt(LocalDateTime.now());
        sub.setThreadName(Thread.currentThread().getName());
        subTaskMapper.updateById(sub);

        long subStart = System.currentTimeMillis();

        try {
            List<Map<String, Object>> dataRows = fetchDataBatch(jdbc, task, ds,
                    sub.getOffsetStart(), sub.getOffsetEnd() - sub.getOffsetStart());
            sub.setRowCount((long) dataRows.size());

            if (cancelFlag.get()) {
                sub.setStatus("CANCELLED");
                subTaskMapper.updateById(sub);
                return;
            }

            long subViolated = 0;
            long subPassed = 0;
            int processedRules = 0;

            for (RuleDefinition rule : rules) {
                if (cancelFlag.get() || Thread.currentThread().isInterrupted()) break;

                long elapsed = System.currentTimeMillis() - subStart;
                if (elapsed > timeoutSec * 1000L) {
                    log.warn("Sub-task {} timed out after {}ms", sub.getId(), elapsed);
                    sub.setErrorMessage("Timeout after " + elapsed + "ms");
                    break;
                }

                long ruleStart = System.currentTimeMillis();
                RuleContext ruleContext = new RuleContext();
                ruleContext.setCurrentRule(rule);
                ruleContext.setDataRows(dataRows);
                ruleContext.setTotalRows(dataRows.size());

                if (RuleType.DOMAIN_CHECK.name().equals(rule.getRuleType())) {
                    loadDictValues(rule, ruleContext);
                }

                String componentId;
                String chainEl;
                if ("SCRIPT".equals(rule.getRuleType()) && rule.getScriptBody() != null && !rule.getScriptBody().isEmpty()) {
                    String scriptNodeId = "script_" + rule.getId() + "_" + sub.getSubTaskIndex();
                    String lang = rule.getScriptLanguage() != null ? rule.getScriptLanguage() : "java";
                    try {
                        LiteFlowNodeBuilder.createScriptNode()
                                .setId(scriptNodeId)
                                .setName("dynamic-" + rule.getId())
                                .setScript(rule.getScriptBody())
                                .setLanguage(lang)
                                .build();
                    } catch (Exception e) {
                        log.debug("Script node {} may already exist: {}", scriptNodeId, e.getMessage());
                    }
                    chainEl = "THEN(" + scriptNodeId + ");";
                } else {
                    componentId = getComponentId(rule.getRuleType());
                    chainEl = "THEN(" + componentId + ");";
                }

                try {
                    LiteflowResponse response = flowExecutor.execute2RespWithEL(chainEl, null, null, ruleContext);
                    if (!response.isSuccess()) {
                        log.error("Rule {} failed in sub-task {}: {}", rule.getId(), sub.getId(), response.getCause());
                    }
                } catch (Exception e) {
                    log.error("Error in sub-task {} rule {}: {}", sub.getId(), rule.getId(), e.getMessage());
                    ruleContext.setViolatedRows(0);
                }

                long violated = ruleContext.getViolatedRows();
                String key = rule.getId() + "_" + rule.getFieldName() + "_" + rule.getRuleType();
                fieldViolatedMap.computeIfAbsent(key, k -> new AtomicLong(0)).addAndGet(violated);
                fieldTotalMap.computeIfAbsent(key, k -> new AtomicLong(0)).addAndGet(dataRows.size());

                if (violated > 0) subViolated += violated;
                else subPassed++;

                processedRules++;

                ExecutionStepLog stepLog = new ExecutionStepLog();
                stepLog.setTaskId(sub.getTaskId());
                stepLog.setStepIndex(sub.getSubTaskIndex() * 1000 + processedRules);
                stepLog.setStepName("子任务" + sub.getSubTaskIndex() + "-" + (rule.getDescription() != null ? rule.getDescription() : rule.getRuleType()));
                stepLog.setRuleId(rule.getId());
                stepLog.setFieldName(rule.getFieldName());
                stepLog.setRuleType(rule.getRuleType());
                stepLog.setStatus("COMPLETED");
                stepLog.setTotalRows((long) dataRows.size());
                stepLog.setViolatedRows(violated);
                stepLog.setDurationMs(System.currentTimeMillis() - ruleStart);
                stepLog.setStartedAt(LocalDateTime.now());
                stepLog.setFinishedAt(LocalDateTime.now());
                stepLogMapper.insert(stepLog);
            }

            sub.setProcessedRules(processedRules);
            sub.setViolatedCount(subViolated);
            sub.setPassedCount(subPassed);
            totalViolated.addAndGet(subViolated);
            totalPassed.addAndGet(subPassed);

            sub.setStatus(cancelFlag.get() ? "CANCELLED" : "COMPLETED");
        } catch (Exception e) {
            log.error("Sub-task {} failed: {}", sub.getId(), e.getMessage(), e);
            sub.setStatus("FAILED");
            sub.setErrorMessage(e.getMessage());
        } finally {
            sub.setFinishedAt(LocalDateTime.now());
            sub.setDurationMs(System.currentTimeMillis() - subStart);
            sub.setCpuUsagePct(resourceMonitor.getCpuUsage());
            sub.setMemoryUsageMb(resourceMonitor.getUsedMemoryMb());
            subTaskMapper.updateById(sub);
        }
    }

    private long countRows(JdbcTemplate jdbc, ExecutionTask task, DataSourceConfig ds) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM ");
        sql.append(task.getTableName());
        appendWhereClause(sql, task);
        Long count = jdbc.queryForObject(sql.toString(), Long.class);
        return count != null ? count : 0;
    }

    private List<Map<String, Object>> fetchDataBatch(JdbcTemplate jdbc, ExecutionTask task,
                                                      DataSourceConfig ds, long offset, long limit) {
        StringBuilder sql = new StringBuilder("SELECT ");

        if (task.getSpecifiedFields() != null && !task.getSpecifiedFields().trim().isEmpty()) {
            sql.append(task.getSpecifiedFields());
        } else {
            sql.append("*");
        }

        sql.append(" FROM ").append(task.getTableName());
        appendWhereClause(sql, task);

        if (task.getPrimaryKeyField() != null && !task.getPrimaryKeyField().trim().isEmpty()) {
            sql.append(" ORDER BY ").append(task.getPrimaryKeyField());
        }

        sql.append(" LIMIT ").append(limit).append(" OFFSET ").append(offset);

        return jdbc.queryForList(sql.toString());
    }

    private void appendWhereClause(StringBuilder sql, ExecutionTask task) {
        boolean hasWhere = false;
        if (task.getTimeFilterField() != null && !task.getTimeFilterField().trim().isEmpty()) {
            if (task.getTimeRangeStart() != null && !task.getTimeRangeStart().isEmpty()) {
                sql.append(hasWhere ? " AND " : " WHERE ");
                sql.append(task.getTimeFilterField()).append(" >= '").append(task.getTimeRangeStart()).append("'");
                hasWhere = true;
            }
            if (task.getTimeRangeEnd() != null && !task.getTimeRangeEnd().isEmpty()) {
                sql.append(hasWhere ? " AND " : " WHERE ");
                sql.append(task.getTimeFilterField()).append(" <= '").append(task.getTimeRangeEnd()).append("'");
            }
        }
    }

    public boolean cancelTask(Long taskId) {
        ExecutionTask task = taskMapper.selectById(taskId);
        if (task == null) return false;

        AtomicBoolean cancelFlag = cancelFlags.get(taskId);
        if (cancelFlag != null) cancelFlag.set(true);

        Future<?> future = runningMainTasks.get(taskId);
        if (future != null) {
            future.cancel(true);
            runningMainTasks.remove(taskId);
        }

        List<ExecutionSubTask> subs = subTaskMapper.selectList(
                new LambdaQueryWrapper<ExecutionSubTask>()
                        .eq(ExecutionSubTask::getTaskId, taskId)
                        .in(ExecutionSubTask::getStatus, "QUEUED", "RUNNING"));
        for (ExecutionSubTask sub : subs) {
            sub.setStatus("CANCELLED");
            sub.setFinishedAt(LocalDateTime.now());
            subTaskMapper.updateById(sub);
        }

        task.setStatus("CANCELLED");
        task.setFinishedAt(LocalDateTime.now());
        task.setCurrentStep("已取消");
        if (task.getStartedAt() != null) {
            task.setDurationMs(Duration.between(task.getStartedAt(), task.getFinishedAt()).toMillis());
        }
        taskMapper.updateById(task);
        cancelFlags.remove(taskId);
        log.info("Task {} cancelled with all sub-tasks", taskId);
        return true;
    }

    public boolean cancelSubTask(Long subTaskId) {
        ExecutionSubTask sub = subTaskMapper.selectById(subTaskId);
        if (sub == null) return false;
        sub.setStatus("CANCELLED");
        sub.setFinishedAt(LocalDateTime.now());
        if (sub.getStartedAt() != null) {
            sub.setDurationMs(Duration.between(sub.getStartedAt(), sub.getFinishedAt()).toMillis());
        }
        subTaskMapper.updateById(sub);
        return true;
    }

    public ExecutionTask getTask(Long taskId) {
        return taskMapper.selectById(taskId);
    }

    public List<ExecutionTask> listTasks(String status) {
        LambdaQueryWrapper<ExecutionTask> query = new LambdaQueryWrapper<ExecutionTask>()
                .orderByDesc(ExecutionTask::getQueuedAt).last("LIMIT 100");
        if (status != null && !status.isEmpty()) {
            query.eq(ExecutionTask::getStatus, status);
        }
        return taskMapper.selectList(query);
    }

    public List<ExecutionSubTask> getSubTasks(Long taskId) {
        return subTaskMapper.selectList(new LambdaQueryWrapper<ExecutionSubTask>()
                .eq(ExecutionSubTask::getTaskId, taskId)
                .orderByAsc(ExecutionSubTask::getSubTaskIndex));
    }

    public List<ExecutionStepLog> getSteps(Long taskId) {
        return stepLogMapper.selectList(new LambdaQueryWrapper<ExecutionStepLog>()
                .eq(ExecutionStepLog::getTaskId, taskId)
                .orderByAsc(ExecutionStepLog::getStepIndex));
    }

    public Map<String, Object> getEngineStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("activeThreads", mainExecutor.getActiveCount());
        status.put("poolSize", mainExecutor.getPoolSize());
        status.put("maxPoolSize", mainExecutor.getMaximumPoolSize());
        status.put("queueSize", mainExecutor.getQueue().size());
        status.put("queueCapacity", queueCapacity);
        status.put("completedTasks", mainExecutor.getCompletedTaskCount());

        Map<String, Object> sysMetrics = resourceMonitor.getSystemMetrics();
        status.putAll(sysMetrics);
        status.put("overloaded", resourceMonitor.isOverloaded(cpuThreshold, memoryThreshold));

        status.put("connectionPools", poolManager.getPoolStats());

        long runningTasks = taskMapper.selectCount(
                new LambdaQueryWrapper<ExecutionTask>().eq(ExecutionTask::getStatus, "RUNNING"));
        long queuedTasks = taskMapper.selectCount(
                new LambdaQueryWrapper<ExecutionTask>().eq(ExecutionTask::getStatus, "QUEUED"));
        status.put("runningTaskCount", runningTasks);
        status.put("queuedTaskCount", queuedTasks);

        return status;
    }

    public void updateSubTaskTimeout(Long taskId, int newTimeoutSec) {
        ExecutionTask task = taskMapper.selectById(taskId);
        if (task != null) {
            task.setMaxSubTaskTimeoutSec(newTimeoutSec);
            taskMapper.updateById(task);
        }
    }

    private void failTask(ExecutionTask task, String message) {
        task.setStatus("FAILED");
        task.setErrorMessage(message);
        task.setFinishedAt(LocalDateTime.now());
        if (task.getStartedAt() != null) {
            task.setDurationMs(Duration.between(task.getStartedAt(), task.getFinishedAt()).toMillis());
        }
        taskMapper.updateById(task);
    }

    private void loadDictValues(RuleDefinition rule, RuleContext ctx) {
        try {
            if (rule.getRuleParams() != null) {
                JsonNode params = MAPPER.readTree(rule.getRuleParams());
                if (params.has("dictCode")) {
                    ctx.setDictValues(dictService.getValuesByCode(params.get("dictCode").asText()));
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
            case "CUSTOM_SQL" -> "customSql";
            case "SCRIPT" -> "script";
            default -> throw new RuntimeException("Unknown rule type: " + ruleType);
        };
    }

    private void logResourceUsage() {
        Map<String, Object> s = getEngineStatus();
        log.info("[Engine] threads={}/{}, queue={}/{}, running={}, queued={}, cpu={}%, heap={}MB/{}MB({}%), overloaded={}",
                s.get("activeThreads"), s.get("maxPoolSize"),
                s.get("queueSize"), s.get("queueCapacity"),
                s.get("runningTaskCount"), s.get("queuedTaskCount"),
                s.get("cpuUsage"), s.get("heapUsedMb"), s.get("heapMaxMb"), s.get("heapUsagePct"),
                s.get("overloaded"));
    }
}

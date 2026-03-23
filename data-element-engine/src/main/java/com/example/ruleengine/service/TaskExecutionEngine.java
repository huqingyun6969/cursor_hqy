package com.example.ruleengine.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.ruleengine.domain.entity.*;
import com.example.ruleengine.domain.vo.ExecutionResultVO;
import com.example.ruleengine.mapper.ExecutionStepLogMapper;
import com.example.ruleengine.mapper.ExecutionTaskMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

@Service
public class TaskExecutionEngine {

    private static final Logger log = LoggerFactory.getLogger(TaskExecutionEngine.class);

    @Value("${engine.max-concurrent-tasks:3}")
    private int maxConcurrentTasks;

    @Value("${engine.queue-capacity:50}")
    private int queueCapacity;

    @Value("${engine.cpu-threshold:90}")
    private int cpuThreshold;

    @Value("${engine.memory-threshold:90}")
    private int memoryThreshold;

    private final ExecutionTaskMapper taskMapper;
    private final ExecutionStepLogMapper stepLogMapper;
    private final RuleExecutionService ruleExecutionService;
    private final RuleGroupService ruleGroupService;
    private final RuleDefinitionService ruleDefinitionService;

    private ThreadPoolExecutor executor;
    private final Map<Long, Future<?>> runningFutures = new ConcurrentHashMap<>();
    private ScheduledExecutorService monitor;

    public TaskExecutionEngine(ExecutionTaskMapper taskMapper,
                                ExecutionStepLogMapper stepLogMapper,
                                RuleExecutionService ruleExecutionService,
                                RuleGroupService ruleGroupService,
                                RuleDefinitionService ruleDefinitionService) {
        this.taskMapper = taskMapper;
        this.stepLogMapper = stepLogMapper;
        this.ruleExecutionService = ruleExecutionService;
        this.ruleGroupService = ruleGroupService;
        this.ruleDefinitionService = ruleDefinitionService;
    }

    @PostConstruct
    public void init() {
        BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>(queueCapacity);
        executor = new ThreadPoolExecutor(
                1, maxConcurrentTasks, 60, TimeUnit.SECONDS, queue,
                new ThreadPoolExecutor.CallerRunsPolicy()
        );
        monitor = Executors.newScheduledThreadPool(1);
        monitor.scheduleAtFixedRate(this::logResourceUsage, 30, 30, TimeUnit.SECONDS);
        log.info("TaskExecutionEngine initialized: maxConcurrent={}, queueCapacity={}, cpuThreshold={}%, memThreshold={}%",
                maxConcurrentTasks, queueCapacity, cpuThreshold, memoryThreshold);
    }

    @PreDestroy
    public void shutdown() {
        executor.shutdownNow();
        monitor.shutdownNow();
    }

    public ExecutionTask submitTask(Long ruleGroupId, String createdBy) {
        if (isResourceOverloaded()) {
            log.warn("System resources overloaded, queuing task for later");
        }

        RuleGroup group = ruleGroupService.getById(ruleGroupId);
        List<RuleDefinition> rules = ruleDefinitionService.getByGroupId(ruleGroupId);

        ExecutionTask task = new ExecutionTask();
        task.setRuleGroupId(ruleGroupId);
        task.setRuleGroupName(group != null ? group.getName() : "Unknown");
        task.setStatus("QUEUED");
        task.setPriority(5);
        task.setTotalRules(rules.size());
        task.setCompletedRules(0);
        task.setProgress(0);
        task.setQueuedAt(LocalDateTime.now());
        task.setCreatedBy(createdBy);
        taskMapper.insert(task);

        for (int i = 0; i < rules.size(); i++) {
            RuleDefinition rule = rules.get(i);
            ExecutionStepLog step = new ExecutionStepLog();
            step.setTaskId(task.getId());
            step.setStepIndex(i + 1);
            step.setStepName(rule.getDescription() != null ? rule.getDescription() : rule.getRuleType() + " on " + rule.getFieldName());
            step.setRuleId(rule.getId());
            step.setFieldName(rule.getFieldName());
            step.setRuleType(rule.getRuleType());
            step.setStatus("PENDING");
            stepLogMapper.insert(step);
        }

        Future<?> future = executor.submit(() -> executeTask(task.getId()));
        runningFutures.put(task.getId(), future);
        log.info("Task {} submitted for rule group {} (queue size: {})", task.getId(), ruleGroupId, executor.getQueue().size());
        return task;
    }

    private void executeTask(Long taskId) {
        ExecutionTask task = taskMapper.selectById(taskId);
        if (task == null) return;

        task.setStatus("RUNNING");
        task.setStartedAt(LocalDateTime.now());
        task.setThreadName(Thread.currentThread().getName());
        taskMapper.updateById(task);

        try {
            long startMem = getUsedMemoryMb();
            ExecutionResultVO result = ruleExecutionService.executeRuleGroup(task.getRuleGroupId());

            task.setExecutionId(result.getExecutionId());
            task.setStatus("COMPLETED");
            task.setProgress(100);
            task.setCompletedRules(result.getTotalRules());
            task.setCurrentStep("全部完成");
            task.setMemoryUsageMb(getUsedMemoryMb() - startMem);

            List<ExecutionStepLog> steps = stepLogMapper.selectList(
                    new LambdaQueryWrapper<ExecutionStepLog>().eq(ExecutionStepLog::getTaskId, taskId));
            for (int i = 0; i < steps.size() && i < result.getDetails().size(); i++) {
                ExecutionStepLog step = steps.get(i);
                var detail = result.getDetails().get(i);
                step.setStatus("COMPLETED");
                step.setTotalRows(detail.getTotalRows());
                step.setViolatedRows(detail.getViolatedRows());
                step.setFinishedAt(LocalDateTime.now());
                stepLogMapper.updateById(step);
            }
        } catch (Exception e) {
            log.error("Task {} failed: {}", taskId, e.getMessage(), e);
            task.setStatus("FAILED");
            task.setErrorMessage(e.getMessage());
        } finally {
            task.setFinishedAt(LocalDateTime.now());
            task.setDurationMs(java.time.Duration.between(task.getStartedAt(), task.getFinishedAt()).toMillis());
            task.setCpuUsagePct(getCpuUsage());
            taskMapper.updateById(task);
            runningFutures.remove(taskId);
        }
    }

    public boolean cancelTask(Long taskId) {
        ExecutionTask task = taskMapper.selectById(taskId);
        if (task == null) return false;

        Future<?> future = runningFutures.get(taskId);
        if (future != null) {
            future.cancel(true);
            runningFutures.remove(taskId);
        }
        task.setStatus("CANCELLED");
        task.setFinishedAt(LocalDateTime.now());
        task.setCurrentStep("已取消");
        if (task.getStartedAt() != null) {
            task.setDurationMs(java.time.Duration.between(task.getStartedAt(), task.getFinishedAt()).toMillis());
        }
        taskMapper.updateById(task);
        log.info("Task {} cancelled", taskId);
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

    public List<ExecutionStepLog> getSteps(Long taskId) {
        return stepLogMapper.selectList(new LambdaQueryWrapper<ExecutionStepLog>()
                .eq(ExecutionStepLog::getTaskId, taskId)
                .orderByAsc(ExecutionStepLog::getStepIndex));
    }

    public Map<String, Object> getEngineStatus() {
        Map<String, Object> status = new ConcurrentHashMap<>();
        status.put("activeThreads", executor.getActiveCount());
        status.put("poolSize", executor.getPoolSize());
        status.put("maxPoolSize", executor.getMaximumPoolSize());
        status.put("queueSize", executor.getQueue().size());
        status.put("queueCapacity", queueCapacity);
        status.put("completedTasks", executor.getCompletedTaskCount());
        status.put("cpuUsage", getCpuUsage());
        status.put("memoryUsedMb", getUsedMemoryMb());
        status.put("memoryMaxMb", Runtime.getRuntime().maxMemory() / 1024 / 1024);
        status.put("memoryUsagePct", BigDecimal.valueOf(getUsedMemoryMb() * 100.0 / (Runtime.getRuntime().maxMemory() / 1024 / 1024)).setScale(1, java.math.RoundingMode.HALF_UP));
        status.put("overloaded", isResourceOverloaded());
        return status;
    }

    private boolean isResourceOverloaded() {
        double cpu = getCpuUsage().doubleValue();
        long memUsed = getUsedMemoryMb();
        long memMax = Runtime.getRuntime().maxMemory() / 1024 / 1024;
        double memPct = memUsed * 100.0 / memMax;
        return cpu >= cpuThreshold || memPct >= memoryThreshold;
    }

    private BigDecimal getCpuUsage() {
        try {
            com.sun.management.OperatingSystemMXBean osBean =
                    (com.sun.management.OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
            double cpu = osBean.getProcessCpuLoad() * 100;
            return BigDecimal.valueOf(cpu).setScale(1, java.math.RoundingMode.HALF_UP);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private long getUsedMemoryMb() {
        MemoryMXBean mem = ManagementFactory.getMemoryMXBean();
        return mem.getHeapMemoryUsage().getUsed() / 1024 / 1024;
    }

    private void logResourceUsage() {
        Map<String, Object> s = getEngineStatus();
        log.info("[Engine Monitor] threads={}/{}, queue={}/{}, completed={}, cpu={}%, mem={}MB/{}MB({}%), overloaded={}",
                s.get("activeThreads"), s.get("maxPoolSize"),
                s.get("queueSize"), s.get("queueCapacity"),
                s.get("completedTasks"),
                s.get("cpuUsage"), s.get("memoryUsedMb"), s.get("memoryMaxMb"), s.get("memoryUsagePct"),
                s.get("overloaded"));
    }
}

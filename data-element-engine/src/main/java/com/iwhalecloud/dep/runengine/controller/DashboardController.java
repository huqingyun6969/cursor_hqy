package com.iwhalecloud.dep.runengine.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iwhalecloud.dep.runengine.domain.entity.*;
import com.iwhalecloud.dep.runengine.domain.vo.R;
import com.iwhalecloud.dep.runengine.mapper.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DataSourceConfigMapper dsMapper;
    private final RuleGroupMapper groupMapper;
    private final RuleDefinitionMapper ruleMapper;
    private final RuleTypeConfigMapper typeMapper;
    private final ExecutionTaskMapper taskMapper;
    private final ExecutionViolationMapper violationMapper;
    private final WorkOrderMapper orderMapper;
    private final QualityReportMapper reportMapper;

    public DashboardController(DataSourceConfigMapper dsMapper, RuleGroupMapper groupMapper,
                                RuleDefinitionMapper ruleMapper, RuleTypeConfigMapper typeMapper,
                                ExecutionTaskMapper taskMapper, ExecutionViolationMapper violationMapper,
                                WorkOrderMapper orderMapper, QualityReportMapper reportMapper) {
        this.dsMapper = dsMapper;
        this.groupMapper = groupMapper;
        this.ruleMapper = ruleMapper;
        this.typeMapper = typeMapper;
        this.taskMapper = taskMapper;
        this.violationMapper = violationMapper;
        this.orderMapper = orderMapper;
        this.reportMapper = reportMapper;
    }

    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        Map<String, Object> s = new LinkedHashMap<>();

        long dsTotal = dsMapper.selectCount(null);
        long dsEnabled = dsMapper.selectCount(new LambdaQueryWrapper<DataSourceConfig>().eq(DataSourceConfig::getStatus, 1));
        s.put("dataSourceTotal", dsTotal);
        s.put("dataSourceEnabled", dsEnabled);
        s.put("dataSourceDisabled", dsTotal - dsEnabled);

        long ruleTypeCount = typeMapper.selectCount(new LambdaQueryWrapper<RuleTypeConfig>().eq(RuleTypeConfig::getStatus, 1));
        s.put("ruleTypeCount", ruleTypeCount);

        List<RuleDefinition> allRules = ruleMapper.selectList(null);
        Map<String, Long> typeUsage = allRules.stream()
                .collect(Collectors.groupingBy(RuleDefinition::getRuleType, Collectors.counting()));
        s.put("ruleTypeUsage", typeUsage);

        long ruleGroupCount = groupMapper.selectCount(null);
        s.put("ruleGroupCount", ruleGroupCount);

        List<RuleGroup> groups = groupMapper.selectList(null);
        long distinctTables = groups.stream()
                .map(RuleGroup::getTableName)
                .filter(t -> t != null && !t.isEmpty())
                .distinct().count();
        s.put("targetTableCount", distinctTables);

        long taskTotal = taskMapper.selectCount(null);
        long taskCompleted = taskMapper.selectCount(new LambdaQueryWrapper<ExecutionTask>().eq(ExecutionTask::getStatus, "COMPLETED"));
        long taskFailed = taskMapper.selectCount(new LambdaQueryWrapper<ExecutionTask>().eq(ExecutionTask::getStatus, "FAILED"));
        long taskRunning = taskMapper.selectCount(new LambdaQueryWrapper<ExecutionTask>().eq(ExecutionTask::getStatus, "RUNNING"));
        long taskQueued = taskMapper.selectCount(new LambdaQueryWrapper<ExecutionTask>().eq(ExecutionTask::getStatus, "QUEUED"));
        s.put("taskTotal", taskTotal);
        s.put("taskCompleted", taskCompleted);
        s.put("taskFailed", taskFailed);
        s.put("taskRunning", taskRunning);
        s.put("taskQueued", taskQueued);

        long violationTotal = violationMapper.selectCount(null);
        s.put("violationTotal", violationTotal);

        long orderTotal = orderMapper.selectCount(null);
        long orderPending = orderMapper.selectCount(new LambdaQueryWrapper<WorkOrder>().eq(WorkOrder::getStatus, "PENDING"));
        long orderProcessing = orderMapper.selectCount(new LambdaQueryWrapper<WorkOrder>().eq(WorkOrder::getStatus, "PROCESSING"));
        long orderCompleted = orderMapper.selectCount(new LambdaQueryWrapper<WorkOrder>().eq(WorkOrder::getStatus, "COMPLETED"));
        s.put("workOrderTotal", orderTotal);
        s.put("workOrderPending", orderPending);
        s.put("workOrderProcessing", orderProcessing);
        s.put("workOrderCompleted", orderCompleted);

        long reportCount = reportMapper.selectCount(null);
        s.put("reportCount", reportCount);
        s.put("ruleCount", (long) allRules.size());

        return R.ok(s);
    }
}

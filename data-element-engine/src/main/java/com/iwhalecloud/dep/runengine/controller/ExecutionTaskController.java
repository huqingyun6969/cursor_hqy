package com.iwhalecloud.dep.runengine.controller;

import com.iwhalecloud.dep.runengine.domain.dto.TaskCreateDTO;
import com.iwhalecloud.dep.runengine.domain.entity.ExecutionStepLog;
import com.iwhalecloud.dep.runengine.domain.entity.ExecutionSubTask;
import com.iwhalecloud.dep.runengine.domain.entity.ExecutionTask;
import com.iwhalecloud.dep.runengine.domain.vo.R;
import com.iwhalecloud.dep.runengine.service.ResourceMonitorService;
import com.iwhalecloud.dep.runengine.service.TaskExecutionEngine;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/task")
public class ExecutionTaskController {

    private final TaskExecutionEngine engine;
    private final ResourceMonitorService resourceMonitor;

    public ExecutionTaskController(TaskExecutionEngine engine, ResourceMonitorService resourceMonitor) {
        this.engine = engine;
        this.resourceMonitor = resourceMonitor;
    }

    @PostMapping("/submit")
    public R<ExecutionTask> submit(@RequestBody TaskCreateDTO dto) {
        try {
            return R.ok(engine.submitTask(dto));
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @PostMapping("/submit/{ruleGroupId}")
    public R<ExecutionTask> submitSimple(@PathVariable Long ruleGroupId,
                                          @RequestParam(required = false) String createdBy) {
        try {
            TaskCreateDTO dto = new TaskCreateDTO();
            dto.setRuleGroupId(ruleGroupId);
            dto.setCreatedBy(createdBy);
            return R.ok(engine.submitTask(dto));
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @PostMapping("/cancel/{taskId}")
    public R<Boolean> cancel(@PathVariable Long taskId) {
        return R.ok(engine.cancelTask(taskId));
    }

    @PostMapping("/cancel-subtask/{subTaskId}")
    public R<Boolean> cancelSubTask(@PathVariable Long subTaskId) {
        return R.ok(engine.cancelSubTask(subTaskId));
    }

    @GetMapping("/{taskId}")
    public R<ExecutionTask> getTask(@PathVariable Long taskId) {
        return R.ok(engine.getTask(taskId));
    }

    @GetMapping("/list")
    public R<List<ExecutionTask>> list(@RequestParam(required = false) String status) {
        return R.ok(engine.listTasks(status));
    }

    @GetMapping("/{taskId}/sub-tasks")
    public R<List<ExecutionSubTask>> subTasks(@PathVariable Long taskId) {
        return R.ok(engine.getSubTasks(taskId));
    }

    @GetMapping("/{taskId}/steps")
    public R<List<ExecutionStepLog>> steps(@PathVariable Long taskId) {
        return R.ok(engine.getSteps(taskId));
    }

    @GetMapping("/engine-status")
    public R<Map<String, Object>> engineStatus() {
        return R.ok(engine.getEngineStatus());
    }

    @GetMapping("/system-metrics")
    public R<Map<String, Object>> systemMetrics() {
        return R.ok(resourceMonitor.getSystemMetrics());
    }

    @PostMapping("/{taskId}/update-timeout")
    public R<Void> updateTimeout(@PathVariable Long taskId, @RequestParam int timeoutSec) {
        engine.updateSubTaskTimeout(taskId, timeoutSec);
        return R.ok(null);
    }

    @GetMapping("/{taskId}/violation-summary")
    public R<Map<String, Object>> violationSummary(@PathVariable Long taskId) {
        return R.ok(engine.getViolationSummary(taskId));
    }
}

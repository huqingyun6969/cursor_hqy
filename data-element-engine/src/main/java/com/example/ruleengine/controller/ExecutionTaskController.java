package com.example.ruleengine.controller;

import com.example.ruleengine.domain.entity.ExecutionStepLog;
import com.example.ruleengine.domain.entity.ExecutionTask;
import com.example.ruleengine.domain.vo.R;
import com.example.ruleengine.service.TaskExecutionEngine;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/task")
public class ExecutionTaskController {

    private final TaskExecutionEngine engine;

    public ExecutionTaskController(TaskExecutionEngine engine) {
        this.engine = engine;
    }

    @PostMapping("/submit/{ruleGroupId}")
    public R<ExecutionTask> submit(@PathVariable Long ruleGroupId,
                                    @RequestParam(required = false) String createdBy) {
        try {
            return R.ok(engine.submitTask(ruleGroupId, createdBy));
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @PostMapping("/cancel/{taskId}")
    public R<Boolean> cancel(@PathVariable Long taskId) {
        return R.ok(engine.cancelTask(taskId));
    }

    @GetMapping("/{taskId}")
    public R<ExecutionTask> getTask(@PathVariable Long taskId) {
        return R.ok(engine.getTask(taskId));
    }

    @GetMapping("/list")
    public R<List<ExecutionTask>> list(@RequestParam(required = false) String status) {
        return R.ok(engine.listTasks(status));
    }

    @GetMapping("/{taskId}/steps")
    public R<List<ExecutionStepLog>> steps(@PathVariable Long taskId) {
        return R.ok(engine.getSteps(taskId));
    }

    @GetMapping("/engine-status")
    public R<Map<String, Object>> engineStatus() {
        return R.ok(engine.getEngineStatus());
    }
}

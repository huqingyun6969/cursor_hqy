package com.iwhalecloud.dep.runengine.service;

import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.engine.runtime.ProcessInstance;
import org.flowable.task.api.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FlowableService {

    private static final Logger log = LoggerFactory.getLogger(FlowableService.class);

    private final RuntimeService runtimeService;
    private final TaskService taskService;

    public FlowableService(RuntimeService runtimeService, TaskService taskService) {
        this.runtimeService = runtimeService;
        this.taskService = taskService;
    }

    public String startProcess(String assignee, String reviewer) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("assignee", assignee);
        variables.put("reviewer", reviewer);
        ProcessInstance instance = runtimeService.startProcessInstanceByKey("dataQualityRemediation", variables);
        log.info("Started process instance: {}", instance.getId());
        return instance.getId();
    }

    public void completeTask(String processInstanceId, boolean approved, String comment) {
        List<Task> tasks = taskService.createTaskQuery()
                .processInstanceId(processInstanceId)
                .active()
                .list();

        if (tasks.isEmpty()) {
            log.warn("No active tasks found for process: {}", processInstanceId);
            return;
        }

        Task task = tasks.get(0);
        Map<String, Object> variables = new HashMap<>();
        variables.put("approved", approved);
        if (comment != null) {
            taskService.addComment(task.getId(), processInstanceId, comment);
        }
        taskService.complete(task.getId(), variables);
        log.info("Completed task {} for process {}", task.getName(), processInstanceId);
    }

    public String getCurrentTaskName(String processInstanceId) {
        List<Task> tasks = taskService.createTaskQuery()
                .processInstanceId(processInstanceId)
                .active()
                .list();
        return tasks.isEmpty() ? "已完成" : tasks.get(0).getName();
    }
}

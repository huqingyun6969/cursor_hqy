package com.iwhalecloud.dep.runengine.service;

import com.iwhalecloud.dep.runengine.domain.dto.TaskCreateDTO;
import com.iwhalecloud.dep.runengine.domain.entity.ExecutionTask;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import tech.powerjob.worker.core.processor.ProcessResult;
import tech.powerjob.worker.core.processor.TaskContext;
import tech.powerjob.worker.core.processor.sdk.BasicProcessor;

@Component
@ConditionalOnProperty(name = "powerjob.enabled", havingValue = "true", matchIfMissing = false)
public class PowerJobTaskProcessor implements BasicProcessor {

    private static final Logger log = LoggerFactory.getLogger(PowerJobTaskProcessor.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final TaskExecutionEngine engine;

    public PowerJobTaskProcessor(TaskExecutionEngine engine) {
        this.engine = engine;
    }

    @Override
    public ProcessResult process(TaskContext context) {
        String jobParams = context.getJobParams();
        log.info("PowerJob triggered task with params: {}", jobParams);

        try {
            TaskCreateDTO dto = MAPPER.readValue(jobParams, TaskCreateDTO.class);
            dto.setPowerjobInstanceId(String.valueOf(context.getInstanceId()));
            ExecutionTask task = engine.submitTask(dto);
            return new ProcessResult(true, "Task submitted: " + task.getId());
        } catch (Exception e) {
            log.error("PowerJob task failed: {}", e.getMessage(), e);
            return new ProcessResult(false, "Failed: " + e.getMessage());
        }
    }
}

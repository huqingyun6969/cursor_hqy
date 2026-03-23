package com.iwhalecloud.dep.runengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("dep_execution_step_log")
public class ExecutionStepLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long taskId;
    private Integer stepIndex;
    private String stepName;
    private Long ruleId;
    private String fieldName;
    private String ruleType;
    private String status;
    private Long totalRows;
    private Long violatedRows;
    private Long durationMs;
    private Long memoryDeltaMb;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
}

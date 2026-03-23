package com.example.ruleengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("execution_task")
public class ExecutionTask {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long ruleGroupId;
    private String ruleGroupName;
    private String status;
    private Integer priority;
    private Integer totalRules;
    private Integer completedRules;
    private String currentStep;
    private Integer progress;
    private Long executionId;
    private String threadName;
    private BigDecimal cpuUsagePct;
    private Long memoryUsageMb;
    private String errorMessage;
    private LocalDateTime queuedAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Long durationMs;
    private String createdBy;
}

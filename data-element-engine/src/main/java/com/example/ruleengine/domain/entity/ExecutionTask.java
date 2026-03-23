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

    private Long dataSourceId;
    private Long totalRows;
    private Integer subTaskCount;
    private Integer completedSubTasks;
    private Integer batchSize;
    private Integer maxConcurrentSubTasks;
    private Integer maxSubTaskTimeoutSec;
    private String specifiedFields;
    private String timeFilterField;
    private String timeRangeStart;
    private String timeRangeEnd;
    private String primaryKeyField;
    private Long rowLimit;
    private String powerjobInstanceId;
    private String tableName;
}

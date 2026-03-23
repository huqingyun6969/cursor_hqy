package com.example.ruleengine.domain.dto;

import lombok.Data;

@Data
public class TaskCreateDTO {
    private Long ruleGroupId;
    private Long dataSourceId;
    private String tableName;
    private String specifiedFields;
    private String timeFilterField;
    private String timeRangeStart;
    private String timeRangeEnd;
    private String primaryKeyField;
    private Long rowLimit;
    private Integer batchSize;
    private Integer maxConcurrentSubTasks;
    private Integer maxSubTaskTimeoutSec;
    private String createdBy;
    private String powerjobInstanceId;
}

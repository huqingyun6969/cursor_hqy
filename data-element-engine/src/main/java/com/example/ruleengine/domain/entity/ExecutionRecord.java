package com.example.ruleengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("execution_record")
public class ExecutionRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long ruleGroupId;
    private String ruleGroupName;
    private Long totalRows;
    private Integer totalRules;
    private Integer passedRules;
    private Integer failedRules;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long durationMs;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}

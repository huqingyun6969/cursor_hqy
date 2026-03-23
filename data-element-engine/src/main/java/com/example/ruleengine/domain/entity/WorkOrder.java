package com.example.ruleengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("work_order")
public class WorkOrder {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;
    private String title;
    private String status;
    private String urgency;
    private String issueType;
    private Long reportId;
    private Long ruleGroupId;
    private String tableName;
    private String dataSourceUnit;
    private String issueDescription;
    private String issueImpact;
    private String suggestion;
    private String processInstanceId;
    private String assignee;
    private String createdBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}

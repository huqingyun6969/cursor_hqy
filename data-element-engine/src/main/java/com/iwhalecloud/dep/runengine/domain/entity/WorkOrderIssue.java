package com.iwhalecloud.dep.runengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("dep_work_order_issue")
public class WorkOrderIssue {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;
    private String fieldName;
    private String fieldCode;
    private String issueType;
    private String ruleDescription;
    private Long issueCount;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}

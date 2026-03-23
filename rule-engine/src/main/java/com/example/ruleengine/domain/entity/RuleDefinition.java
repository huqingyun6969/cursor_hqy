package com.example.ruleengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("rule_definition")
public class RuleDefinition {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long ruleGroupId;
    private String fieldName;
    private String ruleType;
    private String ruleParams;
    private String description;
    private Integer sortOrder;
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}

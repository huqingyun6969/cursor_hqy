package com.iwhalecloud.dep.runengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("dep_rule_definition")
public class RuleDefinition {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long ruleGroupId;
    private String ruleLevel;
    private String fieldName;
    private String ruleType;
    private String ruleParams;
    private String customSql;
    private String scriptBody;
    private String scriptLanguage;
    private String description;
    private String importanceLevel;
    private Integer ruleWeight;
    private Integer sortOrder;
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}

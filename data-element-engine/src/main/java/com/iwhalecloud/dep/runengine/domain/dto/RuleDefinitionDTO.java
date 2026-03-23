package com.iwhalecloud.dep.runengine.domain.dto;

import lombok.Data;

@Data
public class RuleDefinitionDTO {
    private Long id;
    private Long ruleGroupId;
    private String ruleLevel;
    private String fieldName;
    private String ruleType;
    private String ruleParams;
    private String customSql;
    private String description;
    private String importanceLevel;
    private Integer ruleWeight;
    private Integer sortOrder;
    private Integer status;
}

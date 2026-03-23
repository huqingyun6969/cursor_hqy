package com.example.ruleengine.domain.dto;

import lombok.Data;

@Data
public class RuleDefinitionDTO {
    private Long id;
    private Long ruleGroupId;
    private String fieldName;
    private String ruleType;
    private String ruleParams;
    private String description;
    private Integer sortOrder;
    private Integer status;
}

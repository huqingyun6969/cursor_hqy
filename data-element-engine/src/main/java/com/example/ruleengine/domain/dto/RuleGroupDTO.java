package com.example.ruleengine.domain.dto;

import lombok.Data;

import java.util.List;

@Data
public class RuleGroupDTO {
    private Long id;
    private String name;
    private String description;
    private Long dataSourceId;
    private String tableName;
    private String tableLabel;
    private Integer status;
    private List<RuleDefinitionDTO> rules;
}

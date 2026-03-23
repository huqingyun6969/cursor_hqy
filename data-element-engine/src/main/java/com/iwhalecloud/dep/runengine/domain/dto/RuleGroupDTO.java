package com.iwhalecloud.dep.runengine.domain.dto;

import lombok.Data;
import java.util.List;

@Data
public class RuleGroupDTO {
    private Long id;
    private String name;
    private String description;
    private Integer status;
    private List<RuleDefinitionDTO> rules;
}

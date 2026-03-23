package com.iwhalecloud.dep.runengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("dep_rule_chain")
public class RuleChain {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long ruleGroupId;
    private String chainName;
    private String fieldName;
    private String chainEl;
    private String logicType;
    private String description;
    private Integer status;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}

package com.iwhalecloud.dep.runengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("dep_rule_group")
public class RuleGroup {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String description;
    private Long dataSourceId;
    private String tableName;
    private String tableLabel;
    private String querySql;
    private String specifiedFields;
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}

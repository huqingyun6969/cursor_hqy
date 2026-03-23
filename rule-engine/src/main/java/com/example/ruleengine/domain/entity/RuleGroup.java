package com.example.ruleengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("rule_group")
public class RuleGroup {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;
    private String description;
    private Long dataSourceId;
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}

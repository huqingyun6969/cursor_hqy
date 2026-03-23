package com.iwhalecloud.dep.runengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("dep_dict_table")
public class DictTable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String dictCode;
    private String dictName;
    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}

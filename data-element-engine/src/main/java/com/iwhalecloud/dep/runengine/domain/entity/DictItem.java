package com.iwhalecloud.dep.runengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("dep_dict_item")
public class DictItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String dictCode;
    private String itemValue;
    private String itemLabel;
    private Integer sortOrder;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}

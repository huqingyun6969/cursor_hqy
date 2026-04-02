package com.dep.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dep.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dep_std_set")
public class StdSet extends BaseEntity {
    private String name;
    private String code;
    private String setCatalog;
    private String description;
    private String status = "ACTIVE";
}

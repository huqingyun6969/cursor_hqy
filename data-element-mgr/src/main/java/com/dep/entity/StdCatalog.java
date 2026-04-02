package com.dep.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dep.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dep_std_catalog")
public class StdCatalog extends BaseEntity {
    private String name;
    private Long parentId;
    private Integer sortOrder;
}

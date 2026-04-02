package com.dep.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dep.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dep_map_resource")
public class MapResource extends BaseEntity {
    private String resourceName;
    private String resourceCode;
    private String dataSource;
    private Integer fieldCount;
    private Integer stdCount;
    private String ownerDept;
}

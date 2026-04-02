package com.dep.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dep.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dep_map_field")
public class MapField extends BaseEntity {
    private Long resourceId;
    private String fieldName;
    private String fieldCode;
    private String fieldType;
    private String importance = "一般";
    private String featureTag;
    private String stdConfigured = "未配置";
    private String qualityRule;
}

package com.dep.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dep.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dep_std_info")
public class StdInfo extends BaseEntity {
    private Long setId;
    private String stdCode;
    private String stdName;
    private String enName;
    private String stdAlias;
    private String stdContent;
    private String remark;
    private String bizRule;
    private String bizDefinition;
    private String customDef;
    private String valueRange;
    private String dataType;
    private String unit;
    private Integer nullable;
    private Integer isUnique;
    private String valueLength;
    private String valueMin;
    private String valueMax;
    private String authSystem;
    private String stdDefDept;
    private String stdManager;
    private String stdUseDept;
    private String featureTag;
    private String status = "ACTIVE";
}

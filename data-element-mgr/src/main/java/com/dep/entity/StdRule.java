package com.dep.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dep.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dep_std_rule")
public class StdRule extends BaseEntity {
    private Long stdInfoId;
    private String ruleName;
    private String groupType;
    private String ruleType;
    private String ruleDesc;
    private String checkRule;
}

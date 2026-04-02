package com.dep.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dep.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dep_std_doc_rule")
public class StdDocRule extends BaseEntity {
    private Long documentId;
    private String code;
    private String groupType;
    private String groupLabel;
    private String description;
}

package com.dep.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dep.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dep_std_document")
public class StdDocument extends BaseEntity {
    private String name;
    private String code;
    private String typeCategory;
    private String compileUnit;
    private String usageDesc;
    private String taskExecLink;
    private Long catalogId;
    private String attachmentUrl;
    private String attachmentName;
    private String status = "DRAFT";
}

package com.dep.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dep.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dep_std_ref_doc")
public class StdRefDoc extends BaseEntity {
    private Long stdInfoId;
    private String docName;
    private String docDesc;
    private String docCatalog;
    private LocalDateTime effectiveAt;
    private String docUrl;
}

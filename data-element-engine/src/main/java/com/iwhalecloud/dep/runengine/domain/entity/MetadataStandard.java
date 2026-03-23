package com.iwhalecloud.dep.runengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("dep_metadata_standard")
public class MetadataStandard {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long metadataId;
    private Long ruleGroupId;
    private String fieldName;
    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}

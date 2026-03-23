package com.iwhalecloud.dep.runengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("dep_execution_violation")
public class ExecutionViolation {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long executionId;
    private Long detailId;
    private String ruleType;
    private String fieldName;
    private Long rowIndex;
    private String rowData;
    private String fieldValue;
    private String violationReason;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}

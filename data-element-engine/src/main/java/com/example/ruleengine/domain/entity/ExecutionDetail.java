package com.example.ruleengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("execution_detail")
public class ExecutionDetail {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long executionId;
    private Long ruleId;
    private String fieldName;
    private String ruleType;
    private String ruleDescription;
    private Long totalRows;
    private Long violatedRows;
    private BigDecimal complianceRate;
    private String qualityResult;
    private String sampleViolations;
    private Long durationMs;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}

package com.iwhalecloud.dep.runengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("dep_quality_report")
public class QualityReport {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long ruleGroupId;
    private Long taskId;
    private String tableName;
    private String tableLabel;
    private BigDecimal totalScore;
    private String scoreLevel;
    private Long totalRows;
    private Integer totalRules;
    private Integer passedRules;
    private Integer failedRules;
    private Long executionId;
    private String reportData;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}

package com.iwhalecloud.dep.runengine.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class QualityReportVO {
    private Long reportId;
    private String tableName;
    private String tableLabel;
    private BigDecimal totalScore;
    private String scoreLevel;
    private Long totalRows;
    private Integer totalRules;
    private Integer passedRules;
    private Integer failedRules;
    private List<RuleScoreDetail> ruleDetails;
    private String scoreFormula;
    private String createdAt;

    @Data
    public static class RuleScoreDetail {
        private String ruleType;
        private String ruleLevel;
        private String fieldName;
        private String fieldLabel;
        private String importanceLevel;
        private Integer ruleWeight;
        private BigDecimal ruleScore;
        private Long totalRows;
        private Long violatedRows;
        private BigDecimal complianceRate;
        private String qualityResult;
        private String description;
    }
}

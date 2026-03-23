package com.example.ruleengine.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ExecutionResultVO {
    private Long executionId;
    private String ruleGroupName;
    private Long totalRows;
    private Integer totalRules;
    private Integer passedRules;
    private Integer failedRules;
    private String status;
    private Long durationMs;
    private List<RuleResultVO> details;

    @Data
    public static class RuleResultVO {
        private String fieldName;
        private String ruleType;
        private String ruleDescription;
        private Long totalRows;
        private Long violatedRows;
        private BigDecimal complianceRate;
        private String qualityResult;
        private List<String> sampleViolations;
    }
}

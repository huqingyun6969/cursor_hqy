package com.example.ruleengine.domain.dto;

import lombok.Data;

@Data
public class WorkOrderCreateDTO {
    private Long reportId;
    private Long ruleGroupId;
    private String title;
    private String urgency;
    private String issueType;
    private String dataSourceUnit;
    private String issueDescription;
    private String issueImpact;
    private String suggestion;
    private String assignee;
    private String createdBy;
}

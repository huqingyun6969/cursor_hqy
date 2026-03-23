package com.iwhalecloud.dep.runengine.domain.vo;

import com.iwhalecloud.dep.runengine.domain.entity.WorkOrderIssue;
import com.iwhalecloud.dep.runengine.domain.entity.WorkOrderLog;
import lombok.Data;

import java.util.List;

@Data
public class WorkOrderVO {
    private Long id;
    private String orderNo;
    private String title;
    private String status;
    private String urgency;
    private String issueType;
    private Long reportId;
    private Long ruleGroupId;
    private String tableName;
    private String dataSourceUnit;
    private String issueDescription;
    private String issueImpact;
    private String suggestion;
    private String processInstanceId;
    private String assignee;
    private String createdBy;
    private String createdAt;
    private String updatedAt;
    private List<WorkOrderIssue> issues;
    private List<WorkOrderLog> logs;
}

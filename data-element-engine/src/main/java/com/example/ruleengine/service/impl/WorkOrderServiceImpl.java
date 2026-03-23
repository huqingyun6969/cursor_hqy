package com.example.ruleengine.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.ruleengine.domain.dto.WorkOrderCreateDTO;
import com.example.ruleengine.domain.entity.*;
import com.example.ruleengine.domain.vo.QualityReportVO;
import com.example.ruleengine.domain.vo.WorkOrderVO;
import com.example.ruleengine.mapper.WorkOrderIssueMapper;
import com.example.ruleengine.mapper.WorkOrderLogMapper;
import com.example.ruleengine.mapper.WorkOrderMapper;
import com.example.ruleengine.service.ReportService;
import com.example.ruleengine.service.WorkOrderService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class WorkOrderServiceImpl implements WorkOrderService {

    private final WorkOrderMapper orderMapper;
    private final WorkOrderIssueMapper issueMapper;
    private final WorkOrderLogMapper logMapper;
    private final ReportService reportService;

    private static final Map<String, String> STATUS_MAP = Map.of(
            "SUBMIT", "PROCESSING",
            "REJECT", "REJECTED",
            "APPROVE", "COMPLETED",
            "RESUBMIT", "PROCESSING"
    );

    public WorkOrderServiceImpl(WorkOrderMapper orderMapper,
                                 WorkOrderIssueMapper issueMapper,
                                 WorkOrderLogMapper logMapper,
                                 ReportService reportService) {
        this.orderMapper = orderMapper;
        this.issueMapper = issueMapper;
        this.logMapper = logMapper;
        this.reportService = reportService;
    }

    @Override
    @Transactional
    public WorkOrderVO createFromReport(WorkOrderCreateDTO dto) {
        QualityReportVO report = null;
        if (dto.getReportId() != null) {
            report = reportService.getReport(dto.getReportId());
        }

        WorkOrder order = new WorkOrder();
        BeanUtils.copyProperties(dto, order);
        order.setOrderNo(generateOrderNo());
        order.setStatus("PENDING");
        if (report != null) {
            order.setTableName(report.getTableName());
        }
        if (order.getTitle() == null || order.getTitle().isEmpty()) {
            order.setTitle(order.getTableName() + " 数据质量问题处置工单");
        }
        orderMapper.insert(order);

        if (report != null && report.getRuleDetails() != null) {
            for (QualityReportVO.RuleScoreDetail detail : report.getRuleDetails()) {
                if ("FAIL".equals(detail.getQualityResult())) {
                    WorkOrderIssue issue = new WorkOrderIssue();
                    issue.setOrderId(order.getId());
                    issue.setFieldName(detail.getFieldLabel());
                    issue.setFieldCode(detail.getFieldName());
                    issue.setIssueType(mapIssueType(detail.getRuleType()));
                    issue.setRuleDescription(detail.getDescription());
                    issue.setIssueCount(detail.getViolatedRows());
                    issueMapper.insert(issue);
                }
            }
        }

        addLog(order.getId(), "CREATE", dto.getCreatedBy(), "系统", "系统自动生成，检测到不符合标准，发起整改");
        return getDetail(order.getId());
    }

    @Override
    public WorkOrderVO getDetail(Long orderId) {
        WorkOrder order = orderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("Work order not found: " + orderId);

        WorkOrderVO vo = new WorkOrderVO();
        BeanUtils.copyProperties(order, vo);
        if (order.getCreatedAt() != null) {
            vo.setCreatedAt(order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        if (order.getUpdatedAt() != null) {
            vo.setUpdatedAt(order.getUpdatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        vo.setIssues(issueMapper.selectList(new LambdaQueryWrapper<WorkOrderIssue>()
                .eq(WorkOrderIssue::getOrderId, orderId)));
        vo.setLogs(logMapper.selectList(new LambdaQueryWrapper<WorkOrderLog>()
                .eq(WorkOrderLog::getOrderId, orderId)
                .orderByAsc(WorkOrderLog::getCreatedAt)));
        return vo;
    }

    @Override
    public List<WorkOrder> list() {
        return orderMapper.selectList(new LambdaQueryWrapper<WorkOrder>()
                .orderByDesc(WorkOrder::getCreatedAt)
                .last("LIMIT 100"));
    }

    @Override
    @Transactional
    public void processAction(Long orderId, String action, String operator, String operatorDept, String comment) {
        WorkOrder order = orderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("Work order not found: " + orderId);

        String newStatus = STATUS_MAP.getOrDefault(action.toUpperCase(), order.getStatus());
        order.setStatus(newStatus);
        if ("SUBMIT".equalsIgnoreCase(action) || "RESUBMIT".equalsIgnoreCase(action)) {
            order.setAssignee(operator);
        }
        orderMapper.updateById(order);
        addLog(orderId, action.toUpperCase(), operator, operatorDept, comment);
    }

    private void addLog(Long orderId, String action, String operator, String dept, String comment) {
        WorkOrderLog log = new WorkOrderLog();
        log.setOrderId(orderId);
        log.setAction(action);
        log.setOperator(operator);
        log.setOperatorDept(dept);
        log.setComment(comment);
        logMapper.insert(log);
    }

    private String generateOrderNo() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + String.format("%04d", (int) (Math.random() * 10000));
    }

    private String mapIssueType(String ruleType) {
        return switch (ruleType) {
            case "NOT_NULL" -> "字段缺失";
            case "UNIQUE" -> "不重复";
            case "LENGTH" -> "不符合标准";
            case "ID_CARD", "PHONE", "SOCIAL_CREDIT_CODE", "ENCODING_RULE" -> "不符合标准";
            case "DOMAIN_CHECK" -> "非法值";
            case "DATE_FORMAT", "DATE_RANGE" -> "不符合标准";
            default -> "不符合标准";
        };
    }
}

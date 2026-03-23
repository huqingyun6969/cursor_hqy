package com.example.ruleengine.service;

import com.example.ruleengine.domain.entity.QualityReport;
import com.example.ruleengine.domain.vo.QualityReportVO;

import java.util.List;

public interface ReportService {

    QualityReportVO generateReport(Long ruleGroupId);

    QualityReportVO getReport(Long reportId);

    List<QualityReport> listReports();
}

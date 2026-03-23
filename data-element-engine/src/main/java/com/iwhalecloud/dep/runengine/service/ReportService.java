package com.iwhalecloud.dep.runengine.service;

import com.iwhalecloud.dep.runengine.domain.entity.QualityReport;
import com.iwhalecloud.dep.runengine.domain.vo.QualityReportVO;

import java.util.List;

public interface ReportService {

    QualityReportVO generateReport(Long ruleGroupId);

    QualityReportVO getReport(Long reportId);

    List<QualityReport> listReports();
}

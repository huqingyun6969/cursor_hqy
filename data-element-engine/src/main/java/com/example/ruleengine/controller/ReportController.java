package com.example.ruleengine.controller;

import com.example.ruleengine.domain.entity.QualityReport;
import com.example.ruleengine.domain.vo.QualityReportVO;
import com.example.ruleengine.domain.vo.R;
import com.example.ruleengine.service.ReportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/generate/{ruleGroupId}")
    public R<QualityReportVO> generate(@PathVariable Long ruleGroupId) {
        try {
            return R.ok(reportService.generateReport(ruleGroupId));
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @GetMapping("/{reportId}")
    public R<QualityReportVO> getReport(@PathVariable Long reportId) {
        return R.ok(reportService.getReport(reportId));
    }

    @GetMapping("/list")
    public R<List<QualityReport>> list() {
        return R.ok(reportService.listReports());
    }
}

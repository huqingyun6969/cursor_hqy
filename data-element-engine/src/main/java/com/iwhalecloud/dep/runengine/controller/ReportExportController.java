package com.iwhalecloud.dep.runengine.controller;

import com.iwhalecloud.dep.runengine.domain.vo.QualityReportVO;
import com.iwhalecloud.dep.runengine.service.ReportService;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.awt.*;
import java.io.OutputStream;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/report")
public class ReportExportController {

    private final ReportService reportService;

    public ReportExportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/export-pdf/{reportId}")
    public void exportPdf(@PathVariable Long reportId, HttpServletResponse response) throws Exception {
        QualityReportVO report = reportService.getReport(reportId);

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition",
                "attachment; filename=quality_report_" + reportId + ".pdf");

        Document document = new Document(PageSize.A4);
        OutputStream out = response.getOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        BaseFont bfChinese;
        try {
            bfChinese = BaseFont.createFont("STSong-Light", "UniGB-UCS2-H", BaseFont.NOT_EMBEDDED);
        } catch (Exception e) {
            bfChinese = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
        }

        Font titleFont = new Font(bfChinese, 18, Font.BOLD);
        Font headerFont = new Font(bfChinese, 12, Font.BOLD);
        Font bodyFont = new Font(bfChinese, 10, Font.NORMAL);
        Font scoreFont = new Font(bfChinese, 24, Font.BOLD);

        Paragraph title = new Paragraph("Data Quality Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingAfter(15);

        addInfoRow(infoTable, "Table:", report.getTableName() != null ? report.getTableName() : "-", headerFont, bodyFont);
        addInfoRow(infoTable, "Score:", report.getTotalScore() + " (" + report.getScoreLevel() + ")", headerFont, scoreFont);
        addInfoRow(infoTable, "Total Rows:", String.valueOf(report.getTotalRows()), headerFont, bodyFont);
        addInfoRow(infoTable, "Rules:", report.getPassedRules() + " passed / " + report.getFailedRules() + " failed / " + report.getTotalRules() + " total", headerFont, bodyFont);
        addInfoRow(infoTable, "Created:", report.getCreatedAt() != null ? report.getCreatedAt() : "-", headerFont, bodyFont);
        document.add(infoTable);

        if (report.getRuleDetails() != null && !report.getRuleDetails().isEmpty()) {
            Paragraph detailTitle = new Paragraph("Rule Details", headerFont);
            detailTitle.setSpacingBefore(10);
            detailTitle.setSpacingAfter(10);
            document.add(detailTitle);

            PdfPTable detailTable = new PdfPTable(new float[]{2, 2, 2, 1.5f, 1.5f, 1.5f, 1.5f});
            detailTable.setWidthPercentage(100);
            detailTable.setSpacingAfter(10);

            String[] headers = {"Field", "Rule Type", "Description", "Total Rows", "Violated", "Compliance%", "Result"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(230, 230, 250));
                cell.setPadding(5);
                detailTable.addCell(cell);
            }

            for (QualityReportVO.RuleScoreDetail d : report.getRuleDetails()) {
                detailTable.addCell(new Phrase(d.getFieldName(), bodyFont));
                detailTable.addCell(new Phrase(d.getRuleType(), bodyFont));
                detailTable.addCell(new Phrase(d.getDescription() != null ? d.getDescription() : "", bodyFont));
                detailTable.addCell(new Phrase(String.valueOf(d.getTotalRows()), bodyFont));
                detailTable.addCell(new Phrase(String.valueOf(d.getViolatedRows()), bodyFont));
                detailTable.addCell(new Phrase(d.getComplianceRate() != null ? d.getComplianceRate().toString() + "%" : "-", bodyFont));

                PdfPCell resultCell = new PdfPCell(new Phrase(d.getQualityResult(), bodyFont));
                if ("FAIL".equals(d.getQualityResult())) {
                    resultCell.setBackgroundColor(new Color(255, 230, 230));
                } else {
                    resultCell.setBackgroundColor(new Color(230, 255, 230));
                }
                resultCell.setPadding(5);
                detailTable.addCell(resultCell);
            }
            document.add(detailTable);
        }

        if (report.getScoreFormula() != null) {
            Paragraph formula = new Paragraph("Score Formula: " + report.getScoreFormula(), bodyFont);
            formula.setSpacingBefore(10);
            document.add(formula);
        }

        document.close();
        out.flush();
    }

    private void addInfoRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(0);
        labelCell.setPadding(4);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(0);
        valueCell.setPadding(4);
        table.addCell(valueCell);
    }
}

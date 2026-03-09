package com.branchsales.controller;

import com.branchsales.dto.SalesDTO;
import com.branchsales.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales")
    public ResponseEntity<List<SalesDTO>> getSalesReportData(
            @RequestParam(required = false) Long branchId,
            @RequestParam String period) throws Exception {
        return ResponseEntity.ok(reportService.getSalesReportData(branchId, period));
    }

    @GetMapping("/sales/download")
    public ResponseEntity<byte[]> downloadSalesReport(
            @RequestParam(required = false) Long branchId,
            @RequestParam String period) throws Exception {
        
        try {
            byte[] pdfContent = reportService.generateSalesReportPdfByPeriod(branchId, period);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales-report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}

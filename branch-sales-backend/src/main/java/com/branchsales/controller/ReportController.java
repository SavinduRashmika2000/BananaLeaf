package com.branchsales.controller;

import com.branchsales.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@org.springframework.web.bind.annotation.CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales/download")
    public ResponseEntity<byte[]> downloadSalesReport(
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long branchId,
            @org.springframework.web.bind.annotation.RequestParam String period) throws Exception {
        
        System.out.println("Processing PDF download request: branchId=" + branchId + ", period=" + period);
        
        try {
            byte[] pdfContent = reportService.generateSalesReportPdfByPeriod(branchId, period);
            System.out.println("PDF generated successfully, size: " + pdfContent.length);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales-report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (Exception e) {
            System.err.println("Error generating PDF: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}

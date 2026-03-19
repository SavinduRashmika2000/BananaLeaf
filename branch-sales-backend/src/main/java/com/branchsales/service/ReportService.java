package com.branchsales.service;

import com.branchsales.dto.SalesDTO;
import com.branchsales.entity.*;
import com.branchsales.repository.BranchRepository;
import com.branchsales.repository.InvoiceRepository;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.extgstate.PdfExtGState;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.Canvas;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.properties.HorizontalAlignment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.sql.Timestamp;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final InvoiceRepository invoiceRepository;
    private final BranchRepository branchRepository;

    public ReportService(InvoiceRepository invoiceRepository, BranchRepository branchRepository) {
        this.invoiceRepository = invoiceRepository;
        this.branchRepository = branchRepository;
    }

    public List<SalesDTO> getSalesReportData(Long branchId, String period) {
        LocalDateTime[] range = calculateRange(period);
        Timestamp startTimestamp = Timestamp.valueOf(range[0]);
        Timestamp endTimestamp = Timestamp.valueOf(range[1]);

        return invoiceRepository.findByFilters(branchId, startTimestamp, endTimestamp).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public byte[] generateSalesReportPdfByPeriod(Long branchId, String period) throws Exception {
        LocalDateTime[] range = calculateRange(period);
        return generateSalesReportPdf(branchId, range[0], range[1]);
    }

    private LocalDateTime[] calculateRange(String period) {
        java.time.LocalDate today = java.time.LocalDate.now();
        LocalDateTime endDate = today.atTime(23, 59, 59);
        LocalDateTime startDate;

        switch (period.toUpperCase()) {
            case "TODAY":
                startDate = today.atStartOfDay();
                break;
            case "WEEK":
                startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
                break;
            case "LAST_15_DAYS":
                startDate = today.minusDays(15).atStartOfDay();
                break;
            case "LAST_30_DAYS":
                startDate = today.minusDays(30).atStartOfDay();
                break;
            case "LAST_3_MONTHS":
                startDate = today.minusMonths(3).atStartOfDay();
                break;
            case "ALL":
                startDate = LocalDateTime.of(2000, 1, 1, 0, 0);
                break;
            default:
                startDate = today.minusDays(30).atStartOfDay();
        }
        return new LocalDateTime[] { startDate, endDate };
    }

    public byte[] generateSalesReportPdf(Long branchId, LocalDateTime startDate, LocalDateTime endDate)
            throws Exception {
        Timestamp startTimestamp = Timestamp.valueOf(startDate);
        Timestamp endTimestamp = Timestamp.valueOf(endDate);

        List<Invoice> invoices = invoiceRepository.findByFilters(branchId, startTimestamp, endTimestamp);
        Branch selectedBranch = branchId != null ? branchRepository.findById(branchId).orElse(null) : null;

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
        DateTimeFormatter dateOnlyFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Header Section with Logo and Title
        Table headerTable = new Table(UnitValue.createPercentArray(new float[] { 1, 4 }));
        headerTable.setWidth(UnitValue.createPercentValue(100));

        try {
            ImageData imageData;
            try {
                ClassPathResource res = new ClassPathResource("static/logo.png");
                imageData = ImageDataFactory.create(res.getURL());
            } catch (Exception e1) {
                imageData = ImageDataFactory.create("src/main/resources/static/logo.png");
            }

            Image logo = new Image(imageData);
            logo.setHeight(80);
            headerTable.addCell(new Cell().add(logo).setBorder(Border.NO_BORDER));
        } catch (Exception e) {
            headerTable.addCell(new Cell().setBorder(Border.NO_BORDER));
        }

        Cell titleCell = new Cell().add(new Paragraph("NEW BANANA LEAF")
                .setFontSize(30)
                .setBold()
                .setTextAlignment(TextAlignment.LEFT))
                .add(new Paragraph("Sales Report")
                        .setFontSize(18)
                        .setItalic()
                        .setTextAlignment(TextAlignment.LEFT))
                .setBorder(Border.NO_BORDER);
        headerTable.addCell(titleCell);
        document.add(headerTable);

        document.add(new Paragraph("\n"));

        // Report Info
        document.add(new Paragraph("Branch: " + (selectedBranch != null ? selectedBranch.getName() : "All Branches"))
                .setFontSize(12).setBold());
        document.add(new Paragraph(
                "Period: " + startDate.format(dateOnlyFormatter) + " to " + endDate.format(dateOnlyFormatter))
                .setFontSize(12).setBold());
        document.add(new Paragraph("Generated Date: " + LocalDateTime.now().format(formatter))
                .setFontSize(10).setItalic().setMarginBottom(20));

        // Data Table
        float[] columnWidths = { 2, 3, 4, 3, 2 };
        Table table = new Table(UnitValue.createPercentArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));

        // Table Headers
        String[] headers = { "Invoice No", "Date", "Branch", "Total Amount", "Status" };
        for (String header : headers) {
            table.addHeaderCell(new Cell().add(new Paragraph(header).setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                    .setTextAlignment(TextAlignment.CENTER));
        }

        double totalSales = 0;
        for (Invoice invoice : invoices) {
            String invoiceNo = invoice.getIdinvoice() != null ? invoice.getIdinvoice().toString() : "N/A";
            table.addCell(new Cell().add(new Paragraph(invoiceNo)).setTextAlignment(TextAlignment.CENTER));

            String dateFormatted = "N/A";
            if (invoice.getCreatedAt() != null) {
                dateFormatted = invoice.getCreatedAt().toLocalDateTime().format(dateOnlyFormatter);
            }
            table.addCell(new Cell().add(new Paragraph(dateFormatted)).setTextAlignment(TextAlignment.CENTER));

            String branchName = "N/A";
            if (invoice.getBranch() != null && invoice.getBranch().getName() != null) {
                branchName = invoice.getBranch().getName();
            } else if (invoice.getIdinvoice() != null) {
                branchName = "Central Office";
            }
            table.addCell(new Cell().add(new Paragraph(branchName)).setTextAlignment(TextAlignment.CENTER));

            double total = invoice.getTotal() != null ? invoice.getTotal() : 0.0;
            table.addCell(new Cell().add(new Paragraph(String.format("Rs.%.2f", total)))
                    .setTextAlignment(TextAlignment.RIGHT));

            String status = invoice.getStatus() != null ? invoice.getStatus() : "1";
            if ("1".equals(status))
                status = "Completed";
            table.addCell(new Cell().add(new Paragraph(status)).setTextAlignment(TextAlignment.CENTER));

            totalSales += total;
        }

        document.add(table);

        // Summary Section
        document.add(new Paragraph("\n"));
        Table summaryTable = new Table(UnitValue.createPercentArray(new float[] { 3, 1 }));
        summaryTable.setWidth(UnitValue.createPercentValue(40));
        summaryTable.setHorizontalAlignment(HorizontalAlignment.RIGHT);

        summaryTable.addCell(
                new Cell().add(new Paragraph("Number of Transactions:").setBold()).setBorder(Border.NO_BORDER));
        summaryTable.addCell(new Cell().add(new Paragraph(String.valueOf(invoices.size())))
                .setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));

        summaryTable.addCell(new Cell().add(new Paragraph("Total Sales Amount:").setBold().setFontSize(14))
                .setBorder(Border.NO_BORDER));
        summaryTable.addCell(new Cell().add(new Paragraph(String.format("Rs.%.2f", totalSales)).setBold().setFontSize(14))
                .setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));

        document.add(summaryTable);

        // Footer
        document.add(new Paragraph("\n\n\nGenerated by Branch Sales Management System.")
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY));

        // Watermark
        try {
            ImageData watermarkData;
            try {
                ClassPathResource res = new ClassPathResource("static/logo.png");
                watermarkData = ImageDataFactory.create(res.getURL());
            } catch (Exception e1) {
                watermarkData = ImageDataFactory.create("src/main/resources/static/logo.png");
            }

            Image watermark = new Image(watermarkData);
            watermark.setWidth(300);
            watermark.setOpacity(0.15f);

            int numberOfPages = pdf.getNumberOfPages();
            PdfExtGState gState = new PdfExtGState().setFillOpacity(0.15f);

            for (int i = 1; i <= numberOfPages; i++) {
                PdfPage page = pdf.getPage(i);
                PdfCanvas pdfCanvas = new PdfCanvas(page.newContentStreamAfter(), page.getResources(), pdf);
                float x = page.getPageSize().getWidth() / 2;
                float y = page.getPageSize().getHeight() / 2;
                pdfCanvas.saveState();
                pdfCanvas.setExtGState(gState);
                Canvas watermarkCanvas = new Canvas(pdfCanvas, page.getPageSize());
                watermarkCanvas.showTextAligned(new Paragraph("").add(watermark), x, y, i, TextAlignment.CENTER,
                        com.itextpdf.layout.properties.VerticalAlignment.MIDDLE, 0);
                watermarkCanvas.close();
                pdfCanvas.restoreState();
            }
        } catch (Exception e) {
        }

        document.close();
        return baos.toByteArray();
    }

    private SalesDTO convertToDTO(Invoice invoice) {
        return SalesDTO.builder()
                .id(invoice.getId())
                .invoiceLocal(invoice.getIdinvoice())
                .branchName(invoice.getBranch() != null ? invoice.getBranch().getName() : "Central Office")
                .branchId(invoice.getBranch() != null ? invoice.getBranch().getId() : 0L)
                .saleDateTime(invoice.getCreatedAt())
                .totalAmount(invoice.getTotal())
                .paymentType(invoice.getPaymentType())
                .status(invoice.getStatus())
                .build();
    }
}

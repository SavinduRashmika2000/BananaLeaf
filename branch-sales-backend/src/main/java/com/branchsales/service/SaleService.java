package com.branchsales.service;

import com.branchsales.dto.SalesDTO;
import com.branchsales.dto.SalesItemDTO;
import com.branchsales.entity.Invoice;
import com.branchsales.entity.InvoiceId;
import com.branchsales.entity.InvoiceItem;
import com.branchsales.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SaleService {
    private final InvoiceRepository invoiceRepository;

    public SaleService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public List<SalesDTO> getAllSales() {
        return invoiceRepository.findAllSorted().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SalesDTO getSaleById(String compositeId) {
        Invoice invoice = findInvoiceByCompositeId(compositeId);
        return invoice != null ? convertToDTO(invoice) : null;
    }

    public List<SalesItemDTO> getSaleItems(String compositeId) {
        Invoice invoice = findInvoiceByCompositeId(compositeId);
        if (invoice == null || invoice.getItems() == null) {
            return java.util.Collections.emptyList();
        }
        return invoice.getItems().stream()
                .map(this::convertToItemDTO)
                .collect(Collectors.toList());
    }

    private Invoice findInvoiceByCompositeId(String compositeId) {
        if (compositeId == null) return null;
        String[] parts = compositeId.split("-");
        if (parts.length >= 1) {
            try {
                Integer id = Integer.parseInt(parts[0]);
                Long branchId = parts.length > 1 ? Long.parseLong(parts[1]) : 0L;
                return invoiceRepository.findById(new InvoiceId(id, branchId)).orElse(null);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private SalesDTO convertToDTO(Invoice invoice) {
        String branchName = "Central Office";
        if (invoice.getBranch() != null) {
            branchName = invoice.getBranch().getName() != null ? invoice.getBranch().getName() : "Central Office";
        }
    
        return SalesDTO.builder()
                .id(invoice.getId())
                .invoiceLocal(invoice.getIdinvoice())
                .branchName(branchName)
                .branchId(invoice.getBranchId() != null ? invoice.getBranchId() : 0L)
                .saleDateTime(invoice.getCreatedAt())
                .totalAmount(invoice.getTotal())
                .paymentType(invoice.getPaymentType())
                .status(invoice.getStatus())
                .build();
    }

    private SalesItemDTO convertToItemDTO(InvoiceItem item) {
        return SalesItemDTO.builder()
                .productName(item.getProductName())
                .quantity(item.getQty())
                .price(item.getSp())
                .build();
    }
}

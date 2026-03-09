package com.branchsales.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesDTO {
    private String id; // Composite ID
    private Integer invoiceLocal;
    private String branchName;
    private Long branchId;
    private java.sql.Timestamp saleDateTime;
    private Double totalAmount;
    private String paymentType;
    private String status;
    private List<SalesItemDTO> items;
}

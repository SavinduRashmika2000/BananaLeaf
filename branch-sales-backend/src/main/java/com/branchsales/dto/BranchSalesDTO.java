package com.branchsales.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchSalesDTO {
    private Long branchId;
    private String branchName;
    private Double totalSales;
    private Long invoiceCount;
}

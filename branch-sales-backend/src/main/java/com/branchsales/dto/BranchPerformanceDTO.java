package com.branchsales.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchPerformanceDTO {
    private String branchName;
    private double totalSales;
}

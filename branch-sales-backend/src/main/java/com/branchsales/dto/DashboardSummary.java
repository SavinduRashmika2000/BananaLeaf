package com.branchsales.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummary {
    private long offlineBranches;
    private long totalProducts;
    private double totalRevenue;
}

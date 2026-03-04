package com.branchsales.service;

import com.branchsales.dto.DashboardSummary;
import com.branchsales.repository.BranchRepository;
import com.branchsales.repository.ProductRepository;
import com.branchsales.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final BranchRepository branchRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    public DashboardSummary getSummary() {
        Double totalRevenue = saleRepository.sumTotalAmount();
        return DashboardSummary.builder()
                .offlineBranches(branchRepository.countByActiveFalse())
                .totalProducts(productRepository.count())
                .totalRevenue(totalRevenue != null ? totalRevenue : 0.0)
                .build();
    }
}

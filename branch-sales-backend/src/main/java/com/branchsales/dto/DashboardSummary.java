package com.branchsales.dto;

import java.util.List;

public class DashboardSummary {
    private long offlineBranches;
    private long totalProducts;
    private double totalRevenue;
    private List<BranchPerformanceDTO> branchSales;

    public DashboardSummary() {
    }

    public DashboardSummary(long offlineBranches, long totalProducts, double totalRevenue, List<BranchPerformanceDTO> branchSales) {
        this.offlineBranches = offlineBranches;
        this.totalProducts = totalProducts;
        this.totalRevenue = totalRevenue;
        this.branchSales = branchSales;
    }

    public long getOfflineBranches() {
        return offlineBranches;
    }

    public void setOfflineBranches(long offlineBranches) {
        this.offlineBranches = offlineBranches;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<BranchPerformanceDTO> getBranchSales() {
        return branchSales;
    }

    public void setBranchSales(List<BranchPerformanceDTO> branchSales) {
        this.branchSales = branchSales;
    }

    public static DashboardSummaryBuilder builder() {
        return new DashboardSummaryBuilder();
    }

    public static class DashboardSummaryBuilder {
        private long offlineBranches;
        private long totalProducts;
        private double totalRevenue;
        private List<BranchPerformanceDTO> branchSales;

        public DashboardSummaryBuilder offlineBranches(long offlineBranches) {
            this.offlineBranches = offlineBranches;
            return this;
        }

        public DashboardSummaryBuilder totalProducts(long totalProducts) {
            this.totalProducts = totalProducts;
            return this;
        }

        public DashboardSummaryBuilder totalRevenue(double totalRevenue) {
            this.totalRevenue = totalRevenue;
            return this;
        }

        public DashboardSummaryBuilder branchSales(List<BranchPerformanceDTO> branchSales) {
            this.branchSales = branchSales;
            return this;
        }

        public DashboardSummary build() {
            return new DashboardSummary(offlineBranches, totalProducts, totalRevenue, branchSales);
        }
    }
}

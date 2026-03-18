package com.branchsales.service;

import com.branchsales.dto.StockInwardDTO;
import com.branchsales.dto.BulkStockDistributionDTO;
import com.branchsales.dto.BranchQuantityDTO;
import com.branchsales.entity.CentralStock;
import com.branchsales.entity.BranchStockBatch;
import com.branchsales.entity.MainItem;
import com.branchsales.entity.Branch;
import com.branchsales.entity.Dealer;
import com.branchsales.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {
    private final CentralStockRepository centralStockRepository;
    private final BranchStockBatchRepository branchStockBatchRepository;
    private final MainItemRepository mainItemRepository;
    private final BranchRepository branchRepository;
    private final DealerRepository dealerRepository;

    @Transactional
    public void receiveStock(StockInwardDTO dto) {
        MainItem product = mainItemRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Dealer dealer = dealerRepository.findById(dto.getDealerId())
                .orElseThrow(() -> new RuntimeException("Dealer not found"));

        CentralStock stock = CentralStock.builder()
                .product(product)
                .dealer(dealer)
                .quantity(dto.getQuantity())
                .remainingQuantity(dto.getQuantity())
                .costPrice(dto.getCostPrice())
                .build();

        centralStockRepository.save(stock);
    }

    @Transactional
    public void distributeStock(BulkStockDistributionDTO dto) {
        MainItem product = mainItemRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 1. Calculate total requested quantity across all branches
        Double totalRequested = dto.getDistributions().stream()
                .mapToDouble(BranchQuantityDTO::getQuantity)
                .sum();

        // 2. Check total available central stock
        List<CentralStock> availableBatches = centralStockRepository
                .findByProductIdAndRemainingQuantityGreaterThanOrderByCreatedAtAsc(dto.getProductId(), 0.0);
        
        Double totalAvailable = availableBatches.stream()
                .mapToDouble(CentralStock::getRemainingQuantity)
                .sum();

        if (totalRequested > totalAvailable) {
            throw new RuntimeException("Insufficient central stock! Requested: " + totalRequested + ", Available: " + totalAvailable);
        }

        // 3. Perform distribution for each branch
        for (BranchQuantityDTO dist : dto.getDistributions()) {
            if (dist.getQuantity() <= 0) continue;

            Branch branch = branchRepository.findById(dist.getBranchId())
                    .orElseThrow(() -> new RuntimeException("Branch not found ID: " + dist.getBranchId()));

            Double remainingToDistribute = dist.getQuantity();

            for (CentralStock batch : availableBatches) {
                if (remainingToDistribute <= 0) break;
                if (batch.getRemainingQuantity() <= 0) continue;

                Double takeQuantity = Math.min(batch.getRemainingQuantity(), remainingToDistribute);
                
                // Create branch batch
                BranchStockBatch branchBatch = BranchStockBatch.builder()
                        .branch(branch)
                        .product(product)
                        .purchasePrice(batch.getCostPrice())
                        .quantity(takeQuantity)
                        .remainingQuantity(takeQuantity)
                        .build();
                
                branchStockBatchRepository.save(branchBatch);

                // Update central batch (and local list for consistency)
                batch.setRemainingQuantity(batch.getRemainingQuantity() - takeQuantity);
                centralStockRepository.save(batch);

                remainingToDistribute -= takeQuantity;
            }
        }
    }

    public List<CentralStock> getCentralStock() {
        return centralStockRepository.findAll();
    }

    public List<BranchStockBatch> getBranchStock(Long branchId) {
        return branchStockBatchRepository.findByBranchId(branchId);
    }

    public List<BranchStockBatch> getProductStock(Long productId) {
        return branchStockBatchRepository.findByProductId(productId);
    }

    public List<BranchStockBatch> getBranchProductStock(Long branchId, Long productId) {
        return branchStockBatchRepository.findByBranchIdAndProductIdOrderByReceivedAtDesc(branchId, productId);
    }
}

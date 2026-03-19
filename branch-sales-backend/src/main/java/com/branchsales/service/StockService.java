package com.branchsales.service;

import com.branchsales.dto.StockInwardDTO;
import com.branchsales.dto.BulkStockInwardDTO;
import com.branchsales.dto.StockInwardItemDTO;
import com.branchsales.dto.BulkStockDistributionDTO;
import com.branchsales.dto.BranchQuantityDTO;
import com.branchsales.dto.BatchAllocationDTO;
import com.branchsales.entity.CentralStock;
import com.branchsales.entity.BranchStockBatch;
import com.branchsales.entity.MainItem;
import com.branchsales.entity.Branch;
import com.branchsales.entity.Dealer;
import com.branchsales.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    public void receiveBulkStock(BulkStockInwardDTO dto) {
        Dealer dealer = dealerRepository.findById(dto.getDealerId())
                .orElseThrow(() -> new RuntimeException("Dealer not found"));

        for (StockInwardItemDTO itemDTO : dto.getItems()) {
            MainItem product = mainItemRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found ID: " + itemDTO.getProductId()));

            CentralStock stock = CentralStock.builder()
                    .product(product)
                    .dealer(dealer)
                    .quantity(itemDTO.getQuantity())
                    .remainingQuantity(itemDTO.getQuantity())
                    .costPrice(itemDTO.getCostPrice())
                    .build();

            centralStockRepository.save(stock);
        }
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
            Branch branch = branchRepository.findById(dist.getBranchId())
                    .orElseThrow(() -> new RuntimeException("Branch not found ID: " + dist.getBranchId()));

            // CASE A: Manual Batch Allocation
            if (dist.getBatchAllocations() != null && !dist.getBatchAllocations().isEmpty()) {
                for (BatchAllocationDTO allocation : dist.getBatchAllocations()) {
                    if (allocation.getQuantity() <= 0) continue;

                    CentralStock batch = centralStockRepository.findById(allocation.getBatchId())
                            .orElseThrow(() -> new RuntimeException("Batch not found ID: " + allocation.getBatchId()));

                    if (batch.getRemainingQuantity() < allocation.getQuantity()) {
                        throw new RuntimeException("Insufficient quantity in Batch #" + batch.getId() + 
                            " for product " + product.getName() + 
                            ". Available: " + batch.getRemainingQuantity() + ", Requested: " + allocation.getQuantity());
                    }

                    saveBranchBatchAndSync(branch, product, batch, allocation.getQuantity());
                }
            } 
            // CASE B: FIFO (Default Logic)
            else {
                if (dist.getQuantity() == null || dist.getQuantity() <= 0) continue;
                Double remainingToDistribute = dist.getQuantity();

                for (CentralStock batch : availableBatches) {
                    if (remainingToDistribute <= 0) break;
                    if (batch.getRemainingQuantity() <= 0) continue;

                    Double takeQuantity = Math.min(batch.getRemainingQuantity(), remainingToDistribute);
                    saveBranchBatchAndSync(branch, product, batch, takeQuantity);
                    remainingToDistribute -= takeQuantity;
                }

                if (remainingToDistribute > 0) {
                    throw new RuntimeException("Insufficient total central stock for " + product.getName() + " to fulfill branch " + branch.getName());
                }
            }
        }
    }

    private void saveBranchBatchAndSync(Branch branch, MainItem product, CentralStock batch, Double quantity) {
        // Create branch batch
        BranchStockBatch branchBatch = BranchStockBatch.builder()
                .branch(branch)
                .product(product)
                .purchasePrice(batch.getCostPrice())
                .quantity(quantity)
                .remainingQuantity(quantity)
                .build();
        
        branchStockBatchRepository.save(branchBatch);

        // Update central batch
        batch.setRemainingQuantity(batch.getRemainingQuantity() - quantity);
        centralStockRepository.save(batch);
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

    public List<CentralStock> getInwardLog(Long dealerId, String date) {
        if (dealerId != null && date != null) {
            LocalDateTime start = LocalDate.parse(date).atStartOfDay();
            LocalDateTime end = start.plusDays(1);
            return centralStockRepository.findByDealerIdAndCreatedAtBetweenOrderByCreatedAtDesc(dealerId, start, end);
        } else if (dealerId != null) {
            return centralStockRepository.findByDealerIdOrderByCreatedAtDesc(dealerId);
        } else if (date != null) {
            LocalDateTime start = LocalDate.parse(date).atStartOfDay();
            LocalDateTime end = start.plusDays(1);
            return centralStockRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
        }
        return centralStockRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<BranchStockBatch> getDistributeLog() {
        return branchStockBatchRepository.findAllByOrderByReceivedAtDesc();
    }
}


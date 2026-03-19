package com.branchsales.controller;

import com.branchsales.dto.StockInwardDTO;
import com.branchsales.dto.BulkStockInwardDTO;
import com.branchsales.dto.BulkStockDistributionDTO;
import com.branchsales.entity.CentralStock;
import com.branchsales.entity.BranchStockBatch;
import com.branchsales.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class StockController {
    private final StockService stockService;

    @PostMapping("/inward")
    public ResponseEntity<Void> receiveStock(@RequestBody StockInwardDTO dto) {
        stockService.receiveStock(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/inward/bulk")
    public ResponseEntity<Void> receiveBulkStock(@RequestBody BulkStockInwardDTO dto) {
        stockService.receiveBulkStock(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/distribute")
    public ResponseEntity<?> distributeStock(@RequestBody BulkStockDistributionDTO dto) {
        try {
            stockService.distributeStock(dto);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/central")
    public ResponseEntity<List<CentralStock>> getCentralStock() {
        return ResponseEntity.ok(stockService.getCentralStock());
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<BranchStockBatch>> getBranchStock(@PathVariable Long branchId) {
        return ResponseEntity.ok(stockService.getBranchStock(branchId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<BranchStockBatch>> getProductStock(@PathVariable Long productId) {
        return ResponseEntity.ok(stockService.getProductStock(productId));
    }

    @GetMapping("/branch/{branchId}/product/{productId}")
    public ResponseEntity<List<BranchStockBatch>> getBranchProductStock(
            @PathVariable Long branchId, 
            @PathVariable Long productId) {
        return ResponseEntity.ok(stockService.getBranchProductStock(branchId, productId));
    }

    @GetMapping("/log/inward")
    public ResponseEntity<List<CentralStock>> getInwardLog(
            @RequestParam(required = false) Long dealerId,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(stockService.getInwardLog(dealerId, date));
    }

    @GetMapping("/log/distribute")
    public ResponseEntity<List<BranchStockBatch>> getDistributeLog() {
        return ResponseEntity.ok(stockService.getDistributeLog());
    }

    @Data
    @AllArgsConstructor
    public static class ErrorResponse {
        private String message;
    }
}


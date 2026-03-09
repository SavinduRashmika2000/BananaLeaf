package com.branchsales.controller;

import com.branchsales.dto.SalesDTO;
import com.branchsales.dto.SalesItemDTO;
import com.branchsales.service.SaleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:5173")
public class SaleController {
    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping
    public ResponseEntity<List<SalesDTO>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesDTO> getSaleById(@PathVariable String id) {
        return ResponseEntity.ok(saleService.getSaleById(id));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<SalesItemDTO>> getSaleItems(@PathVariable String id) {
        return ResponseEntity.ok(saleService.getSaleItems(id));
    }
}

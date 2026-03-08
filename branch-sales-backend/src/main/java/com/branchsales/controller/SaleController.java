package com.branchsales.controller;

import com.branchsales.entity.Sale;
import com.branchsales.entity.SaleItem;
import com.branchsales.service.SaleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Collections;

@RestController
@RequestMapping("/api/sales")
public class SaleController {
    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> getSaleById(@PathVariable Long id) {
        return saleService.getSaleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<SaleItem>> getSaleItems(@PathVariable Long id) {
        return saleService.getSaleById(id)
                .map(sale -> ResponseEntity.ok(sale.getItems()))
                .orElse(ResponseEntity.ok(Collections.emptyList()));
    }
}

package com.branchsales.controller;

import com.branchsales.dto.ProductDTO;
import com.branchsales.entity.MainCategory;
import com.branchsales.repository.MainCategoryRepository;
import com.branchsales.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {
    private final ProductService productService;
    private final MainCategoryRepository mainCategoryRepository;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<MainCategory>> getAllCategories() {
        return ResponseEntity.ok(mainCategoryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<ProductDTO> addProduct(@RequestBody ProductDTO product) {
        return ResponseEntity.ok(productService.addProduct(product));
    }
}

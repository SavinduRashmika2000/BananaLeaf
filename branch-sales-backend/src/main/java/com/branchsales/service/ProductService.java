package com.branchsales.service;

import com.branchsales.dto.ProductDTO;
import com.branchsales.entity.MainItem;
import com.branchsales.repository.MainItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final MainItemRepository mainItemRepository;

    public List<ProductDTO> getAllProducts() {
        return mainItemRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO addProduct(ProductDTO productDTO) {
        MainItem mainItem = MainItem.builder()
                .name(productDTO.getName())
                .code(productDTO.getSku())
                .sp(productDTO.getSellingPrice())
                .status(productDTO.isActive() ? "1" : "0")
                .build();
        MainItem saved = mainItemRepository.save(mainItem);
        return convertToDTO(saved);
    }

    private ProductDTO convertToDTO(MainItem item) {
        return ProductDTO.builder()
                .id(item.getId())
                .sku(item.getCode())
                .name(item.getName())
                .sellingPrice(item.getSp())
                .active("1".equals(item.getStatus()))
                .build();
    }
}

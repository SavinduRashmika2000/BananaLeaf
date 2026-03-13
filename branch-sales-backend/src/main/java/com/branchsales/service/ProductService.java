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
        return mainItemRepository.findAllWithCategory().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO addProduct(ProductDTO productDTO) {
        Double priceToSave = productDTO.getPrice() != null ? productDTO.getPrice() : productDTO.getSellingPrice();
        MainItem mainItem = MainItem.builder()
                .name(productDTO.getName())
                .price(priceToSave)
                .code(productDTO.getSku())
                .build();
        MainItem saved = mainItemRepository.save(mainItem);
        return convertToDTO(saved);
    }

    private ProductDTO convertToDTO(MainItem item) {
        String sku = item.getCode() != null ? item.getCode() : (item.getId() != null ? "PROD-" + item.getId() : "N/A");

        return ProductDTO.builder()
                .id(item.getId())
                .sku(sku)
                .name(item.getName())
                .price(item.getPrice())
                .sellingPrice(item.getPrice())
                .active(true)
                .category(item.getMainCategory() != null ? item.getMainCategory().getName() : "Uncategorized")
                .build();
    }
}

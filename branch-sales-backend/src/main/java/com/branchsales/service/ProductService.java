package com.branchsales.service;

import com.branchsales.dto.ProductDTO;
import com.branchsales.dto.CentralStockDTO;
import com.branchsales.dto.BranchPriceRequest;
import com.branchsales.repository.CentralStockRepository;
import com.branchsales.entity.MainItem;
import com.branchsales.entity.MainCategory;
import com.branchsales.repository.MainItemRepository;
import com.branchsales.repository.MainCategoryRepository;
import com.branchsales.repository.BranchProductRepository;
import com.branchsales.repository.BranchRepository;
import com.branchsales.repository.SyncLogRepository;
import com.branchsales.repository.BranchSyncStatusRepository;
import com.branchsales.dto.BranchProductDTO;
import com.branchsales.dto.BranchProductUpdateRequest;
import com.branchsales.entity.Branch;
import com.branchsales.entity.BranchProduct;
import com.branchsales.entity.SyncLog;
import com.branchsales.entity.BranchSyncStatus;
import com.branchsales.entity.BranchProductPrice;
import com.branchsales.repository.BranchProductPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final MainItemRepository mainItemRepository;
    private final MainCategoryRepository mainCategoryRepository;
    private final BranchProductRepository branchProductRepository;
    private final BranchRepository branchRepository;
    private final SyncLogRepository syncLogRepository;
    private final BranchSyncStatusRepository branchSyncStatusRepository;
    private final CloudChangeLogService cloudChangeLogService;
    private final BranchProductPriceRepository branchProductPriceRepository;
    private final CentralStockRepository centralStockRepository;

    // Fetch all products with branch pricing logic
    public List<ProductDTO> getAllProducts(Long branchId) {
        List<MainItem> items = mainItemRepository.findAll();
        
        Map<Long, Double> branchPrices = new HashMap<>();
        Map<Long, Boolean> branchAvailability = new HashMap<>();
        
        if (branchId != null) {
            branchProductRepository.findByBranchId(branchId)
                .forEach(bp -> {
                    if (bp.getProduct() != null) {
                        branchPrices.put(bp.getProduct().getId(), bp.getBranchPrice());
                        branchAvailability.put(bp.getProduct().getId(), bp.getIsAvailable());
                    }
                });
        }

        return items.stream()
                .map(item -> convertToDTO(item, branchPrices.get(item.getId()), branchAvailability.get(item.getId())))
                .collect(Collectors.toList());
    }

    public List<ProductDTO> searchProducts(String name) {
        List<MainItem> items = mainItemRepository.findAll().stream()
                .filter(item -> item.getName().toLowerCase().contains(name.toLowerCase()))
                .collect(Collectors.toList());
        
        return items.stream()
                .map(item -> convertToDTO(item, null, null))
                .collect(Collectors.toList());
    }

    public List<BranchProductDTO> getProductBranches(Long productId) {
        MainItem product = mainItemRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        List<Branch> allBranches = branchRepository.findAll();
        List<BranchProduct> branchProducts = branchProductRepository.findByProductId(productId);
        
        Map<Long, BranchProduct> bpMap = branchProducts.stream()
                .collect(Collectors.toMap(bp -> bp.getBranch().getId(), bp -> bp));
        
        return allBranches.stream()
                .map(branch -> {
                    BranchProduct bp = bpMap.get(branch.getId());
                    return BranchProductDTO.builder()
                            .branchId(branch.getId())
                            .branchName(branch.getName())
                            .productId(productId)
                            .productName(product.getName())
                            .branchPrice(bp != null ? bp.getBranchPrice() : product.getSellingPrice())
                            .isAvailable(bp != null ? bp.getIsAvailable() : true)
                            .isPriceUpdated(bp != null ? bp.getIsPriceUpdated() : false)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateBranchProducts(BranchProductUpdateRequest request) {
        for (BranchProductDTO dto : request.getUpdates()) {
            BranchProduct bp = branchProductRepository.findByBranchIdAndProductId(dto.getBranchId(), dto.getProductId())
                    .orElseGet(() -> {
                        Branch branch = branchRepository.findById(dto.getBranchId())
                                .orElseThrow(() -> new RuntimeException("Branch not found"));
                        MainItem product = mainItemRepository.findById(dto.getProductId())
                                .orElseThrow(() -> new RuntimeException("Product not found"));
                        return BranchProduct.builder()
                                .branch(branch)
                                .product(product)
                                .build();
                    });

            boolean isPriceChanged = dto.getBranchPrice() != null && !dto.getBranchPrice().equals(bp.getBranchPrice());
            boolean isAvailabilityChanged = dto.getIsAvailable() != null && !dto.getIsAvailable().equals(bp.getIsAvailable());

            if (isPriceChanged || isAvailabilityChanged) {
                // If branchPrice is null (cleared in UI), reset to product's default selling price
                Double newPrice = dto.getBranchPrice() != null ? dto.getBranchPrice() : bp.getProduct().getSellingPrice();
                bp.setBranchPrice(newPrice);
                
                bp.setIsAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : bp.getIsAvailable());
                bp.setIsPriceUpdated(true); // Always mark as overridden when edited/cleared
                branchProductRepository.save(bp);
            }
        }
    }

    public List<ProductDTO> getAllProducts() {
        return getAllProducts(null);
    }

    @Transactional
    public void updateBranchPrice(BranchPriceRequest request) {
        MainItem product = mainItemRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        BranchProductPrice priceRecord = branchProductPriceRepository
                .findByProductIdAndBranchId(request.getProductId(), request.getBranchId())
                .orElse(new BranchProductPrice());

        // Conflict handling: Server only accepts updates based on the current version
        if (request.getVersion() != null && priceRecord.getVersion() != null 
            && !request.getVersion().equals(priceRecord.getVersion())) {
            throw new RuntimeException("Conflict: Branch price was updated by another sync (Version mismatch)");
        }

        // Increment version manually for branch-specific overrides
        Long nextVersion = (priceRecord.getVersion() != null ? priceRecord.getVersion() : 0L) + 1;

        priceRecord.setProduct(product);
        priceRecord.setBranchId(request.getBranchId());
        priceRecord.setPrice(request.getPrice());
        priceRecord.setVersion(nextVersion);

        BranchProductPrice savedPrice = branchProductPriceRepository.save(priceRecord);
        logSyncRecord("price", product.getId(), request.getBranchId(), "UPDATE", savedPrice.getVersion());
        
        // Phase 1: Cloud Change Log Integration
        cloudChangeLogService.logChange(
            "branch_product_price", 
            savedPrice.getId(), 
            "UPDATE", 
            savedPrice, 
            request.getBranchId()
        );
    }

    // Add product without requiring category from frontend
    public ProductDTO addProduct(ProductDTO productDTO) {
        Double sellingPriceToSave = productDTO.getSellingPrice() != null ? productDTO.getSellingPrice() : productDTO.getPrice();
        Double unitPriceToSave = productDTO.getPrice();

        // Assign default category "Uncategorized"
        MainCategory defaultCategory = mainCategoryRepository.findByName("Uncategorized")
                .orElseGet(() -> {
                    // If it doesn't exist, create one
                    MainCategory newCat = MainCategory.builder()
                            .name("Uncategorized")
                            .build();
                    return mainCategoryRepository.save(newCat);
                });

        MainItem mainItem = MainItem.builder()
                .name(productDTO.getName())
                .sellingPrice(sellingPriceToSave)
                .unitPrice(unitPriceToSave)
                .code(productDTO.getSku())
                .mainCategory(defaultCategory) // always set a category
                .active("1")
                .build();

        MainItem saved = mainItemRepository.save(mainItem);
        
        // Create branch_products records for all branches
        List<Branch> branches = branchRepository.findAll();
        System.out.println("Processing " + branches.size() + " branches for new product: " + saved.getName());
        if (productDTO.getBranchProducts() != null) {
            System.out.println("Provided branch products count: " + productDTO.getBranchProducts().size());
        }

        for (Branch branch : branches) {
            Double branchPrice = saved.getSellingPrice();
            boolean isOverridden = true; 

            if (productDTO.getBranchProducts() != null) {
                BranchProductDTO specificDTO = productDTO.getBranchProducts().stream()
                        .filter(bpDTO -> bpDTO.getBranchId() != null && bpDTO.getBranchId().equals(branch.getId()))
                        .findFirst()
                        .orElse(null);
                
                if (specificDTO != null) {
                    System.out.println("Found match for branch " + branch.getName() + " (ID " + branch.getId() + "): " + specificDTO.getBranchPrice());
                    if (specificDTO.getBranchPrice() != null) {
                        branchPrice = specificDTO.getBranchPrice();
                    }
                }
            }

            BranchProduct bp = BranchProduct.builder()
                    .branch(branch)
                    .product(saved)
                    .branchPrice(branchPrice)
                    .isAvailable(true)
                    .isPriceUpdated(isOverridden)
                    .build();
            branchProductRepository.save(bp);
        }

        logSyncRecord("product", saved.getId(), null, "INSERT", saved.getVersion());

        // Phase 1: Cloud Change Log Integration
        cloudChangeLogService.logChange(
            "main_item", 
            saved.getId(), 
            "INSERT", 
            saved, 
            null
        );

        return convertToDTO(saved, null, null);
    }

    public List<ProductDTO> getProductsUpdatedSince(Long branchId, LocalDateTime lastSync) {
        List<MainItem> allItems = mainItemRepository.findAll();
        
        // Get branch specific prices for these items
        Map<Long, Double> branchPrices = new HashMap<>();
        Map<Long, Boolean> branchAvailability = new HashMap<>();
        
        branchProductRepository.findByBranchId(branchId)
            .forEach(bp -> {
                if (bp.getProduct() != null) {
                    branchPrices.put(bp.getProduct().getId(), bp.getBranchPrice());
                    branchAvailability.put(bp.getProduct().getId(), bp.getIsAvailable());
                }
            });

        return allItems.stream()
                .filter(item -> {
                    // Check if item was updated globally
                    boolean itemUpdated = item.getUpdatedAt() != null && item.getUpdatedAt().isAfter(lastSync);
                    
                    // Check if branch settings were updated
                    Optional<BranchProduct> bp = branchProductRepository.findByBranchIdAndProductId(branchId, item.getId());
                    boolean settingsUpdated = bp.isPresent() && bp.get().getUpdatedAt() != null && bp.get().getUpdatedAt().isAfter(lastSync);
                    
                    return itemUpdated || settingsUpdated;
                })
                .map(item -> {
                    ProductDTO dto = convertToDTO(item, branchPrices.get(item.getId()), branchAvailability.get(item.getId()));
                    Optional<BranchProduct> bp = branchProductRepository.findByBranchIdAndProductId(branchId, item.getId());
                    if (bp.isPresent() && bp.get().getUpdatedAt() != null && (item.getUpdatedAt() == null || bp.get().getUpdatedAt().isAfter(item.getUpdatedAt()))) {
                        dto.setUpdatedAt(bp.get().getUpdatedAt());
                    } else {
                        dto.setUpdatedAt(item.getUpdatedAt());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void confirmSync(Long branchId, LocalDateTime syncTime) {
        BranchSyncStatus status = branchSyncStatusRepository.findById(branchId)
                .orElse(new BranchSyncStatus(branchId, syncTime));
        status.setLastSyncTime(syncTime);
        branchSyncStatusRepository.save(status);
    }

    public List<SyncLog> getUpdates(Long sinceVersion, Long branchId) {
        return syncLogRepository.findUpdates(sinceVersion, branchId);
    }

    private void logSyncRecord(String type, Long id, Long branchId, String op, Long version) {
        SyncLog log = SyncLog.builder()
                .entityType(type)
                .entityId(id)
                .branchId(branchId)
                .operation(op)
                .version(version)
                .build();
        syncLogRepository.save(log);
    }

    private ProductDTO convertToDTO(MainItem item, Double branchPrice, Boolean isAvailable) {
        String sku = item.getCode() != null ? item.getCode() : (item.getId() != null ? "PROD-" + item.getId() : "N/A");
        
        // Use branch price if exists, otherwise use default sellingPrice
        Double finalSellingPrice = branchPrice != null ? branchPrice : item.getSellingPrice();

        // Fetch central stock batches for this product
        List<CentralStockDTO> batches = centralStockRepository
                .findByProductIdAndRemainingQuantityGreaterThanOrderByCreatedAtAsc(item.getId(), 0.0)
                .stream()
                .map(batch -> CentralStockDTO.builder()
                        .id(batch.getId())
                        .quantity(batch.getQuantity())
                        .remainingQuantity(batch.getRemainingQuantity())
                        .costPrice(batch.getCostPrice())
                        .dealerName(batch.getDealer() != null ? batch.getDealer().getName() : "Direct")
                        .createdAt(batch.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ProductDTO.builder()
                .id(item.getId())
                .sku(sku)
                .name(item.getName())
                .price(item.getUnitPrice())
                .sellingPrice(finalSellingPrice)
                .active(isAvailable != null ? isAvailable : ("1".equals(item.getActive()) || "true".equalsIgnoreCase(item.getActive())))
                .category("") // DO NOT RETURN CATEGORY (as requested)
                .centralStock(batches)
                .build();
    }
}
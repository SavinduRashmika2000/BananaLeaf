package com.branchsales.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CentralStockDTO {
    private Long id;
    private Double quantity;
    private Double remainingQuantity;
    private Double costPrice;
    private String dealerName;
    private LocalDateTime createdAt;
}

package com.branchsales.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockInwardItemDTO {
    private Long productId;
    private Double quantity;
    private Double costPrice;
}

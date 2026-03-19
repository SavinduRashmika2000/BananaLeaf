package com.branchsales.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkStockInwardDTO {
    private Long dealerId;
    private List<StockInwardItemDTO> items;
}

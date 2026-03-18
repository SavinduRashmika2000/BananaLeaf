package com.branchsales.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkStockDistributionDTO {
    private Long productId;
    private List<BranchQuantityDTO> distributions;
}

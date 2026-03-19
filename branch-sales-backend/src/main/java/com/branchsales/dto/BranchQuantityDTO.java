package com.branchsales.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchQuantityDTO {
    private Long branchId;
    private Double quantity;
    private List<BatchAllocationDTO> batchAllocations; // Optional manual allocation
}

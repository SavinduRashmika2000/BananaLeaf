package com.branchsales.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchAllocationDTO {
    private Long batchId;
    private Double quantity;
}

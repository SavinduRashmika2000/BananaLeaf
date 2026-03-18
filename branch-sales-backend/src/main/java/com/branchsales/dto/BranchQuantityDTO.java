package com.branchsales.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchQuantityDTO {
    private Long branchId;
    private Double quantity;
}

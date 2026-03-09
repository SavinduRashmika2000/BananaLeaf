package com.branchsales.entity;

import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GRNId implements Serializable {
    private Long idgrn;
    private Long branchId;
}

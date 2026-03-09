package com.branchsales.entity;

import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GRNMainItemId implements Serializable {
    private Long idgrnMainItem;
    private Long grnIdgrn;
    private Long branchId;
}

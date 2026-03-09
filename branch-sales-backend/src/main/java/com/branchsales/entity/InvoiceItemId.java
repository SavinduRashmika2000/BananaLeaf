package com.branchsales.entity;

import java.io.Serializable;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItemId implements Serializable {
    private Integer idMainItemHasInvoice;
    private Integer invoice;
}

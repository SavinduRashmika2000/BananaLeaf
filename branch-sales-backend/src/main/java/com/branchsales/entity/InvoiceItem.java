package com.branchsales.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "invoice_has_main_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(InvoiceItemId.class)
public class InvoiceItem {
    @Id
    @Column(name = "idMain_Item_has_invoice")
    private Integer idMainItemHasInvoice;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_idinvoice", referencedColumnName = "idinvoice")
    @JsonBackReference
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Main_Item_idmain_item")
    private MainItem mainItem;

    @Column(name = "qty")
    @JsonProperty("quantity")
    private Double qty;

    @Column(name = "up")
    private Double up;

    @Column(name = "sp")
    @JsonProperty("price")
    private Double sp;

    @JsonProperty("productName")
    public String getProductName() {
        return mainItem != null ? mainItem.getName() : "Unknown Item";
    }
}

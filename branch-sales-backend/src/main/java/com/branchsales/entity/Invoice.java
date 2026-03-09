package com.branchsales.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "invoice")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Invoice {
    @Id
    @Column(name = "idinvoice")
    @JsonProperty("invoiceLocal")
    private Integer idinvoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(name = "date")
    private String date;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "s_charge")
    private Double sCharge;

    @Column(name = "total")
    @JsonProperty("totalAmount")
    private Double total;

    @Column(name = "payment_type")
    @JsonProperty("paymentType")
    private String paymentType;

    @Column(name = "discount")
    private Double discount;

    @Column(name = "table_no")
    @JsonProperty("tableNo")
    private String tableNo;

    @Column(name = "steward")
    private String steward;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private java.sql.Timestamp createdAt;

    @JsonProperty("id")
    public String getId() {
        return idinvoice + "-" + (branch != null ? branch.getId() : "0");
    }

    @JsonProperty("saleDateTime")
    public java.sql.Timestamp getSaleDateTime() {
        return createdAt;
    }

    @JsonManagedReference
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InvoiceItem> items;
}

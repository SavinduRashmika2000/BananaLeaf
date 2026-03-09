package com.branchsales.entity;

import lombok.*;
import jakarta.persistence.*;
import java.sql.Date;

@Entity
@Table(name = "grn")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(GRNId.class)
public class GRN {
    @Id
    private Long idgrn;

    @Id
    @Column(name = "branch_id")
    private Long branchId;

    private Date date;
    private String warranty;
    private Double amount;
    private String status;

    @Column(name = "supplier_idsupplier")
    private Long supplierId;

    @Column(name = "user_iduser")
    private Long userId;

    @Column(name = "invoice_no")
    private String invoiceNo;

    @Column(name = "image_path")
    private String imagePath;

    @Lob
    private byte[] image;

    private Integer storeskey;
}

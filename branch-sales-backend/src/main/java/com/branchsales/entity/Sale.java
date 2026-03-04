package com.branchsales.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String branchName;

    @Column(nullable = false)
    private String invoiceLocal;

    @Column(nullable = false)
    private LocalDateTime saleDateTime;

    @Column(nullable = false)
    private double totalAmount;

    @Column(nullable = false)
    private String status;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id")
    private List<SaleItem> items;
}

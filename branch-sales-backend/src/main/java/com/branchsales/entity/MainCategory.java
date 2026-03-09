package com.branchsales.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "main_category")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MainCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idMain_category")
    private Long id;

    private String name;
    private String status;
}

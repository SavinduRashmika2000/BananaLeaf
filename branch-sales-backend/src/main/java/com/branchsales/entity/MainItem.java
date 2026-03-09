package com.branchsales.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "main_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MainItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idmain_item")
    @JsonProperty("id")
    private Long id;

    @Column(name = "Main_category_idMain_category")
    private Long categoryId;

    @Column(name = "name")
    private String name;

    @Column(name = "code")
    @JsonProperty("sku")
    private String code;

    @Column(name = "up")
    private Double up;

    @Column(name = "sp")
    @JsonProperty("sellingPrice")
    private Double sp;

    @Column(name = "status")
    private String status;

    @JsonProperty("active")
    public boolean isActive() {
        return "1".equals(status);
    }

    @JsonProperty("active")
    public void setActive(boolean active) {
        this.status = active ? "1" : "0";
    }
}

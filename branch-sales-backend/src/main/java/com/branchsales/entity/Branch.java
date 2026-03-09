package com.branchsales.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "branches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String location;
    
    private Integer status;

    @JsonProperty("active")
    public boolean isActive() {
        return status != null && status == 1;
    }

    @JsonProperty("active")
    public void setActive(boolean active) {
        this.status = active ? 1 : 0;
    }

    @JsonIgnore
    @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL)
    private List<Invoice> invoices;
}

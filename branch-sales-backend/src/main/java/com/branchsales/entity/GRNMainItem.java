package com.branchsales.entity;

import lombok.*;
import jakarta.persistence.*;
import java.sql.Date;

@Entity
@Table(name = "grn_main_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(GRNMainItemId.class)
public class GRNMainItem {
    @Id
    @Column(name = "idgrn_main_item")
    private Long idgrnMainItem;

    @Id
    @Column(name = "grn_idgrn")
    private Long grnIdgrn;

    @Id
    @Column(name = "branch_id")
    private Long branchId;

    @ManyToOne
    @JoinColumn(name = "Main_Item_idmain_item", referencedColumnName = "idmain_item")
    private MainItem mainItem;

    private Double qty;
    private Double up;
    private Double sp;

    @Column(name = "qty_bonus")
    private Double qtyBonus;

    private Date mfd;
    private Date exp;
}

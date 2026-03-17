package com.branchsales.repository;

import com.branchsales.dto.BranchSalesDTO;
import com.branchsales.entity.Invoice;
import com.branchsales.entity.InvoiceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SalesRepository extends JpaRepository<Invoice, InvoiceId> {
    @Query("""
    SELECT new com.branchsales.dto.BranchSalesDTO(
    b.id,
    b.name,
    COALESCE(SUM(i.total), 0.0),
    COUNT(i.idinvoice)
    )
    FROM Branch b
    LEFT JOIN Invoice i
    ON i.branch.id = b.id
    AND DATE(i.createdAt) = CURRENT_DATE
    AND i.status = 'ACTIVE'
    GROUP BY b.id, b.name
    ORDER BY b.id
    """)
    List<BranchSalesDTO> getTodayBranchSales();
}

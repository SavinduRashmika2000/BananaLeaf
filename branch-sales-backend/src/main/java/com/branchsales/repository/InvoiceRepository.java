package com.branchsales.repository;

import com.branchsales.entity.Invoice;
import com.branchsales.entity.InvoiceId;
import com.branchsales.dto.BranchPerformanceDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.sql.Timestamp;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, InvoiceId> {
    @Query("SELECT i FROM Invoice i WHERE (:branchId IS NULL OR i.branchId = :branchId) " +
           "AND i.createdAt BETWEEN :startDate AND :endDate ORDER BY i.createdAt DESC")
    List<Invoice> findByFilters(@Param("branchId") Long branchId, 
                                @Param("startDate") Timestamp startDate, 
                                @Param("endDate") Timestamp endDate);

    @Query("SELECT i FROM Invoice i ORDER BY i.createdAt DESC")
    List<Invoice> findAllSorted();

    @Query("SELECT SUM(i.total) FROM Invoice i")
    Double sumTotalAmount();

    @Query("SELECT new com.branchsales.dto.BranchPerformanceDTO(COALESCE(b.name, 'Central Office'), SUM(i.total)) " +
           "FROM Invoice i LEFT JOIN i.branch b GROUP BY b.name, i.branch")
    List<BranchPerformanceDTO> findBranchPerformance();
}

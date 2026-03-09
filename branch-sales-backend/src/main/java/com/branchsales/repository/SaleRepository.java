package com.branchsales.repository;

import com.branchsales.dto.BranchPerformanceDTO;
import com.branchsales.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    @Query("SELECT SUM(s.totalAmount) FROM Sale s")
    Double sumTotalAmount();

    @Query("SELECT new com.branchsales.dto.BranchPerformanceDTO(s.branch.name, SUM(s.totalAmount)) " +
            "FROM Sale s GROUP BY s.branch.name")
    List<BranchPerformanceDTO> findBranchPerformance();

    @Query("SELECT s FROM Sale s WHERE (:branchId IS NULL OR s.branch.id = :branchId) " +
            "AND s.saleDateTime BETWEEN :startDate AND :endDate")
    List<Sale> findByFilters(
            @Param("branchId") Long branchId, 
            @Param("startDate") java.time.LocalDateTime startDate, 
            @Param("endDate") java.time.LocalDateTime endDate);
}

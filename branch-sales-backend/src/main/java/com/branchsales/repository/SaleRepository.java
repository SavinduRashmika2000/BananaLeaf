package com.branchsales.repository;

import com.branchsales.dto.BranchPerformanceDTO;
import com.branchsales.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    @Query("SELECT SUM(s.totalAmount) FROM Sale s")
    Double sumTotalAmount();

    @Query("SELECT new com.branchsales.dto.BranchPerformanceDTO(s.branchName, SUM(s.totalAmount)) " +
            "FROM Sale s GROUP BY s.branchName")
    List<BranchPerformanceDTO> findBranchPerformance();
}

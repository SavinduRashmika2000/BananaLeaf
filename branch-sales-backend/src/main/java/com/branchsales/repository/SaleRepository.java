package com.branchsales.repository;

import com.branchsales.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    @Query("SELECT SUM(s.totalAmount) FROM Sale s")
    Double sumTotalAmount();
}

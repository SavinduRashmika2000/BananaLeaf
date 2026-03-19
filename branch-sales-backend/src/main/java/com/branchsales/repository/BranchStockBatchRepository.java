package com.branchsales.repository;

import com.branchsales.entity.BranchStockBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BranchStockBatchRepository extends JpaRepository<BranchStockBatch, Long> {
    
    @Query("SELECT bsb FROM BranchStockBatch bsb WHERE bsb.branch.id = :branchId AND bsb.product.id = :productId AND bsb.remainingQuantity > 0 ORDER BY bsb.receivedAt ASC")
    List<BranchStockBatch> findAvailableBatches(Long branchId, Long productId);

    @Query("SELECT SUM(bsb.remainingQuantity) FROM BranchStockBatch bsb WHERE bsb.branch.id = :branchId AND bsb.product.id = :productId")
    Double getTotalQuantity(Long branchId, Long productId);

    List<BranchStockBatch> findByBranchId(Long branchId);

    List<BranchStockBatch> findByProductId(Long productId);

    List<BranchStockBatch> findByBranchIdAndProductIdOrderByReceivedAtDesc(Long branchId, Long productId);

    List<BranchStockBatch> findAllByOrderByReceivedAtDesc();
}

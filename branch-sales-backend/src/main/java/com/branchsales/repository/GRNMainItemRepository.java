package com.branchsales.repository;

import com.branchsales.entity.GRNMainItem;
import com.branchsales.entity.GRNMainItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GRNMainItemRepository extends JpaRepository<GRNMainItem, GRNMainItemId> {
}

package com.branchsales.repository;

import com.branchsales.entity.MainItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MainItemRepository extends JpaRepository<MainItem, Long> {
}

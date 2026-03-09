package com.branchsales.repository;

import com.branchsales.entity.GRN;
import com.branchsales.entity.GRNId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GRNRepository extends JpaRepository<GRN, GRNId> {
}

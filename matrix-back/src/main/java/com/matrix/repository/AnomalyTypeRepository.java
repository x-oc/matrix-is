package com.matrix.repository;

import com.matrix.entity.auxiliary.AnomalyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnomalyTypeRepository extends JpaRepository<AnomalyType, Long> {
}
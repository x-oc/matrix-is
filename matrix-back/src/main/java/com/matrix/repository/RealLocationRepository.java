package com.matrix.repository;

import com.matrix.entity.auxiliary.RealLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RealLocationRepository extends JpaRepository<RealLocation, Long> {
}
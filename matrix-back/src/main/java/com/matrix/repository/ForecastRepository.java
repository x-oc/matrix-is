package com.matrix.repository;

import com.matrix.entity.primary.Forecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForecastRepository extends JpaRepository<Forecast, Long> {
    List<Forecast> findByOracleRequestUnitId(Long unitId);
}
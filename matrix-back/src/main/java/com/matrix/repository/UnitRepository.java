package com.matrix.repository;

import com.matrix.entity.primary.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    List<Unit> findByStatus(String status);
    List<Unit> findByDisagreementIndexGreaterThan(Double threshold);
    List<Unit> findByRealLocationId(Long locationId);

    @Query("SELECT u FROM Unit u WHERE u.disagreementIndex > :threshold AND u.status IN :statuses")
    List<Unit> findCandidates(@Param("threshold") Double threshold,
                              @Param("statuses") List<String> statuses);
}
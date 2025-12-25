package com.matrix.repository;

import com.matrix.entity.enums.OracleRequestStatusEnum;
import com.matrix.entity.primary.OracleRequest;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OracleRequestRepository extends JpaRepository<OracleRequest, Long> {
    @EntityGraph(attributePaths = {"unit"})
    List<OracleRequest> findByStatus(OracleRequestStatusEnum status);
    List<OracleRequest> findByUnitId(Long unitId);
    List<OracleRequest> findByRequestedById(Long userId);

    @Query("SELECT or FROM OracleRequest or WHERE or.unit.id = :unitId AND or.status = 'PENDING'")
    List<OracleRequest> findPendingByUnitId(@Param("unitId") Long unitId);
}
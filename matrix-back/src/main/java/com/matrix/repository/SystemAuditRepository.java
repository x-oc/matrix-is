package com.matrix.repository;

import com.matrix.entity.primary.SystemAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemAuditRepository extends JpaRepository<SystemAudit, Long> {
    List<SystemAudit> findByInitiatedById(Long userId);
}
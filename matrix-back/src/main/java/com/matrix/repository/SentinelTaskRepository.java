package com.matrix.repository;

import com.matrix.entity.primary.SentinelTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SentinelTaskRepository extends JpaRepository<SentinelTask, Long> {
    List<SentinelTask> findByStatus(String status);
    List<SentinelTask> findByCreatedById(Long userId);
}
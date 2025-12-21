package com.matrix.repository;

import com.matrix.entity.primary.ChosenOne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChosenOneRepository extends JpaRepository<ChosenOne, Long> {
    List<ChosenOne> findByMatrixIterationId(Long matrixIterationId);
    List<ChosenOne> findByRestrictionsLiftedTrue();
}
package com.matrix.repository;

import com.matrix.entity.auxiliary.MatrixIteration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MatrixIterationRepository extends JpaRepository<MatrixIteration, Long> {
    Optional<MatrixIteration> findTopByOrderByIdDesc();
}
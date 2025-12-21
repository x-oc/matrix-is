package com.matrix.service;

import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.MatrixIterationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MatrixIterationService extends BaseService<MatrixIteration, Long> {

    private final MatrixIterationRepository matrixIterationRepository;

    @Transactional(readOnly = true)
    public MatrixIteration getCurrentIteration() {
        return matrixIterationRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new ResourceNotFoundException("No matrix iteration found"));
    }

    @Transactional
    public MatrixIteration createIteration(Integer num, String description) {
        MatrixIteration iteration = new MatrixIteration();
        iteration.setNum(num);
        iteration.setDescription(description);
        return matrixIterationRepository.save(iteration);
    }
}
package com.matrix.controller;

import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.service.MatrixIterationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matrix-iterations")
@RequiredArgsConstructor
public class MatrixIterationController extends BaseController {

    private final MatrixIterationService matrixIterationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MatrixIteration>>> getAllIterations() {
        List<MatrixIteration> iterations = matrixIterationService.findAll();
        return success(iterations);
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<MatrixIteration>> getCurrentIteration() {
        MatrixIteration iteration = matrixIterationService.getCurrentIteration();
        return success(iteration);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MatrixIteration>> createIteration(
            @RequestParam Integer num,
            @RequestParam String description) {
        MatrixIteration iteration = matrixIterationService.createIteration(num, description);
        return created("Matrix iteration created", iteration);
    }
}
package com.matrix.controller;

import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.primary.Unit;
import com.matrix.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController extends BaseController {

    private final CandidateService candidateService;

    @PostMapping("/detect")
    public ResponseEntity<ApiResponse<Void>> detectCandidates() {
        candidateService.detectCandidates();
        return success("Candidates detection started");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Unit>>> getAllCandidates() {
        List<Unit> candidates = candidateService.findCandidates();
        return success(candidates);
    }

    @PostMapping("/{unitId}/request-oracle")
    public ResponseEntity<ApiResponse<Void>> requestOraclePrediction(
            @PathVariable Long unitId,
            @RequestParam Long requestedById) {
        candidateService.requestOraclePrediction(unitId, requestedById);
        return success("Oracle prediction requested");
    }

    @GetMapping("/high-disagreement")
    public ResponseEntity<ApiResponse<List<Unit>>> getUnitsWithHighDisagreement() {
        List<Unit> units = candidateService.getUnitsWithHighDisagreement();
        return success(units);
    }
}
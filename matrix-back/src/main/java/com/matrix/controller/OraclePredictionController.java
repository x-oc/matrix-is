package com.matrix.controller;

import com.matrix.dto.request.OraclePredictionRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.OraclePredictionResponse;
import com.matrix.entity.primary.OracleRequest;
import com.matrix.service.OracleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/oracle-predictions")
@RequiredArgsConstructor
public class OraclePredictionController extends BaseController {

    private final OracleService oracleService;

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<OracleRequest>> requestPrediction(
            @Valid @RequestBody OraclePredictionRequest request) {
        OracleRequest oracleRequest = oracleService.requestPrediction(request);
        return created("Oracle prediction request submitted", oracleRequest);
    }

//    @PostMapping("/{requestId}/process")
//    public ResponseEntity<ApiResponse<OraclePredictionResponse>> processPrediction(
//            @PathVariable Long requestId) {
//        OraclePredictionResponse response = oracleService.processPredictionAndGetResponse(requestId);
//        return success("Oracle prediction processed", response);
//    }

    @GetMapping("/unit/{unitId}/latest")
    public ResponseEntity<ApiResponse<OraclePredictionResponse>> getLatestPrediction(
            @PathVariable Long unitId) {
        OraclePredictionResponse response = oracleService.getLatestPredictionForUnit(unitId);
        if (response == null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "No predictions found for unit", null, System.currentTimeMillis()));
        }
        return success("Latest prediction retrieved", response);
    }
}
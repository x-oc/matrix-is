package com.matrix.controller;

import com.matrix.dto.mappers.CommonMapper;
import com.matrix.dto.request.OraclePredictionRequest;
import com.matrix.dto.request.OracleProcessPredictionRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.ForecastResponse;
import com.matrix.dto.response.OraclePredictionResponse;
import com.matrix.dto.response.OracleRequestResponse;
import com.matrix.entity.primary.Forecast;
import com.matrix.entity.primary.OracleRequest;
import com.matrix.service.OracleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/oracle")
@RequiredArgsConstructor
public class OracleController extends BaseController {

    private final OracleService oracleService;

    @PostMapping("/request-prediction")
    public ResponseEntity<ApiResponse<OracleRequestResponse>> requestPrediction(
            @Valid @RequestBody OraclePredictionRequest request) {
        OracleRequest oracleRequest = oracleService.requestPrediction(request);
        return created("Oracle prediction requested", CommonMapper.map(oracleRequest));
    }

    @PostMapping("/process-prediction")
    public ResponseEntity<ApiResponse<Void>> processPrediction(
            @Valid @RequestBody OracleProcessPredictionRequest request) {
        oracleService.processPredictionAndGetResponse(request);
        return success("Prediction processed successfully");
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<ApiResponse<List<OracleRequestResponse>>> getPendingRequests() {
        List<OracleRequest> requests = oracleService.getPendingRequests();
        return success(requests.stream().map(CommonMapper::map).toList());
    }

    @GetMapping("/forecasts/unit/{unitId}")
    public ResponseEntity<ApiResponse<List<ForecastResponse>>> getForecastsByUnit(@PathVariable Long unitId) {
        List<Forecast> forecasts = oracleService.getForecastsByUnit(unitId);
        return success(forecasts.stream().map(CommonMapper::map).toList());
    }

    @GetMapping("/predictions/unit/{unitId}/latest")
    public ResponseEntity<ApiResponse<OraclePredictionResponse>> getLatestPredictionForUnit(
            @PathVariable Long unitId) {
        OraclePredictionResponse response = oracleService.getLatestPredictionForUnit(unitId);
        if (response == null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "No predictions found for unit", null, System.currentTimeMillis()));
        }
        return success("Latest prediction retrieved", response);
    }
}
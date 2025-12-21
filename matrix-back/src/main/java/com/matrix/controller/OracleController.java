package com.matrix.controller;

import com.matrix.dto.request.RequestOraclePredictionRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.primary.Forecast;
import com.matrix.entity.primary.OracleRequest;
import com.matrix.service.OracleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/oracle")
@RequiredArgsConstructor
public class OracleController extends BaseController {

    private final OracleService oracleService;

    @PostMapping("/request-prediction")
    public ResponseEntity<ApiResponse<Void>> requestPrediction(
            @Valid @RequestBody RequestOraclePredictionRequest request) {
        oracleService.requestPrediction(request);
        return created("Oracle prediction requested");
    }

    @PostMapping("/process-prediction/{requestId}")
    public ResponseEntity<ApiResponse<Forecast>> processPrediction(
            @PathVariable Long requestId,
            @RequestParam String forecast) {
        Forecast result = oracleService.processPrediction(requestId, forecast);
        return success("Prediction processed successfully", result);
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<ApiResponse<List<OracleRequest>>> getPendingRequests() {
        List<OracleRequest> requests = oracleService.getPendingRequests();
        return success(requests);
    }

    @GetMapping("/forecasts/unit/{unitId}")
    public ResponseEntity<ApiResponse<List<Forecast>>> getForecastsByUnit(@PathVariable Long unitId) {
        List<Forecast> forecasts = oracleService.getForecastsByUnit(unitId);
        return success(forecasts);
    }
}
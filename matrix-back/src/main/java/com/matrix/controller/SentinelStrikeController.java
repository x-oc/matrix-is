package com.matrix.controller;

import com.matrix.dto.request.SentinelStrikeRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.service.SentinelStrikeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sentinels")
@RequiredArgsConstructor
public class SentinelStrikeController extends BaseController {

    private final SentinelStrikeService sentinelStrikeService;

    @PostMapping("/strike")
    public ResponseEntity<ApiResponse<Void>> requestSentinelStrike(
            @Valid @RequestBody SentinelStrikeRequest request) {
        sentinelStrikeService.requestStrike(
                request.getTargetCoordinates(),
                request.getSentinelCount(),
                request.getPriority(),
                request.getRequestedById()
        );
        return success("Sentinel strike requested");
    }

    @GetMapping("/strike/status/{requestId}")
    public ResponseEntity<ApiResponse<Object>> getStrikeStatus(@PathVariable Long requestId) {
        Object status = sentinelStrikeService.getStrikeStatus(requestId);
        return success(status);
    }

    @PostMapping("/strike/{requestId}/execute")
    public ResponseEntity<ApiResponse<Void>> executeStrike(@PathVariable Long requestId) {
        sentinelStrikeService.executeStrike(requestId);
        return success("Sentinel strike executed");
    }
}
package com.matrix.controller;

import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.DashboardSummaryResponse;
import com.matrix.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController extends BaseController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary() {
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary();
        return success(summary);
    }

    @GetMapping("/tickets/status")
    public ResponseEntity<ApiResponse<Object>> getTicketsByStatus() {
        Object stats = dashboardService.getTicketStatusStatistics();
        return success(stats);
    }

    @GetMapping("/candidates/stats")
    public ResponseEntity<ApiResponse<Object>> getCandidateStatistics() {
        Object stats = dashboardService.getCandidateStatistics();
        return success(stats);
    }

    @GetMapping("/system/health")
    public ResponseEntity<ApiResponse<Object>> getSystemHealth() {
        Object health = dashboardService.getSystemHealthMetrics();
        return success(health);
    }
}
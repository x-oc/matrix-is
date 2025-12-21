package com.matrix.controller;

import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.primary.Report;
import com.matrix.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController extends BaseController {

    private final ReportService reportService;

    @PostMapping("/generate-daily")
    public ResponseEntity<ApiResponse<Report>> generateDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodEnd) {
        Report report = reportService.generateDailyReport(periodStart, periodEnd);
        return created("Daily report generated", report);
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<Report>> getLatestReport() {
        Report report = reportService.getLatestReport();
        return success(report);
    }
}
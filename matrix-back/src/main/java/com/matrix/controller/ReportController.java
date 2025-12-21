package com.matrix.controller;

import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.DailyReportResponse;
import com.matrix.entity.primary.Report;
import com.matrix.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController extends BaseController {

    private final ReportService reportService;

    @PostMapping("/generate-daily")
    public ResponseEntity<ApiResponse<DailyReportResponse>> generateDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodEnd) {
        DailyReportResponse report = reportService.generateDailyReportForArchitect(periodStart, periodEnd);
        return created("Daily report generated", report);
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<Report>> getLatestReport() {
        Report report = reportService.getLatestReport();
        return success(report);
    }

    @GetMapping("/for-architect")
    public ResponseEntity<ApiResponse<DailyReportResponse>> getArchitectReport() {
        LocalDateTime periodEnd = LocalDateTime.now();
        LocalDateTime periodStart = periodEnd.minusHours(24);
        DailyReportResponse report = reportService.generateDailyReportForArchitect(periodStart, periodEnd);
        return success("Architect report ready", report);
    }
}
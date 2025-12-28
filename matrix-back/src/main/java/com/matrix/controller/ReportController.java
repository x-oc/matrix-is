package com.matrix.controller;

import com.matrix.dto.mappers.CommonMapper;
import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.ReportResponse;
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
    public ResponseEntity<ApiResponse<ReportResponse>> generateDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodEnd) {
        Report report = reportService.generateReportByTime(periodStart, periodEnd);
        return created("Daily report generated", CommonMapper.map(report));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<ReportResponse>> getLatestReport() {
        Report report = reportService.getLatestReport();
        return success(CommonMapper.map(report));
    }
}
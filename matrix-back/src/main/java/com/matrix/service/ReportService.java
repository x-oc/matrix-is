package com.matrix.service;

import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.primary.Report;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.ReportRepository;
import com.matrix.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final DatabaseProcedureService databaseProcedureService;
    private final CustomUserDetailsService customUserDetailsService;

    @Transactional(readOnly = true)
    public Report getLatestReport() {
        return reportRepository.findAll()
                .stream()
                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No reports found"));
    }

    public Report getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Отчёт с id = " + id + " не найден"));
    }


    @Transactional
    public Report generateReportByTime(LocalDateTime periodStart, LocalDateTime periodEnd) {
        customUserDetailsService.checkRoles(List.of(RoleEnum.MONITOR));
        Long reportId = databaseProcedureService.generateReportByTime(periodStart, periodEnd);
        return getReportById(reportId);
    }


    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void generateAutomaticDailyReport() {
        log.info("Generating automatic daily report for Architect...");
        LocalDateTime periodEnd = LocalDateTime.now();
        LocalDateTime periodStart = periodEnd.minusHours(24);
        databaseProcedureService.generateReportByTime(periodStart, periodEnd);
    }
}
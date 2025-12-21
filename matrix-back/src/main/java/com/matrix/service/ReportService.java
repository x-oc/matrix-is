package com.matrix.service;

import com.matrix.dto.response.DailyReportResponse;
import com.matrix.entity.enums.TicketImportanceEnum;
import com.matrix.entity.enums.TicketStatusEnum;
import com.matrix.entity.primary.Report;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.ReportRepository;
import com.matrix.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final TicketRepository ticketRepository;

    @Transactional
    public DailyReportResponse generateDailyReportForArchitect(LocalDateTime periodStart, LocalDateTime periodEnd) {
        var tickets = ticketRepository.findByPeriod(periodStart, periodEnd);

        DailyReportResponse response = new DailyReportResponse();
        response.setPeriodStart(periodStart);
        response.setPeriodEnd(periodEnd);
        response.setGeneratedAt(LocalDateTime.now());

        int totalTickets = tickets.size();
        int resolvedTickets = 0;
        int pendingTickets = 0;
        int highPriorityTickets = 0;

        Map<String, Integer> threatLevelStats = new HashMap<>();
        threatLevelStats.put("LEVEL_1", 0);
        threatLevelStats.put("LEVEL_2", 0);
        threatLevelStats.put("LEVEL_3", 0);

        for (var ticket : tickets) {
            if (ticket.getStatus() == TicketStatusEnum.CLOSED) {
                resolvedTickets++;
            }
            if (ticket.getStatus() == TicketStatusEnum.IN_PROGRESS ||
                    ticket.getStatus() == TicketStatusEnum.UNDER_REVIEW) {
                pendingTickets++;
            }
            if (ticket.getImportanceLevel() == TicketImportanceEnum.HIGH) {
                highPriorityTickets++;
            }

            String threatKey = "LEVEL_" + ticket.getThreatLevel();
            threatLevelStats.put(threatKey, threatLevelStats.get(threatKey) + 1);
        }

        response.setTotalTickets(totalTickets);
        response.setResolvedTickets(resolvedTickets);
        response.setPendingTickets(pendingTickets);
        response.setHighPriorityTickets(highPriorityTickets);
        response.setTicketsByThreatLevel(threatLevelStats);

        double stabilityScore = calculateStabilityScore(resolvedTickets, totalTickets);
        response.setSystemStabilityScore(stabilityScore);

        saveReportToDatabase(response);

        return response;
    }

    @Transactional(readOnly = true)
    public DailyReportResponse getLatestReportForArchitect() {
        LocalDateTime periodEnd = LocalDateTime.now();
        LocalDateTime periodStart = periodEnd.minusHours(24);
        return generateDailyReportForArchitect(periodStart, periodEnd);
    }

    @Transactional(readOnly = true)
    public Report getLatestReport() {
        return reportRepository.findAll()
                .stream()
                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No reports found"));
    }

    private double calculateStabilityScore(int resolved, int total) {
        if (total == 0) return 100.0;
        return (resolved / (double) total) * 100.0;
    }

    private void saveReportToDatabase(DailyReportResponse response) {
        Report report = new Report();
        report.setPeriodStart(response.getPeriodStart());
        report.setPeriodEnd(response.getPeriodEnd());
        report.setGeneratedData(convertToJson(response));
        report.setCreatedAt(response.getGeneratedAt());
        reportRepository.save(report);
    }

    private String convertToJson(DailyReportResponse response) {
        return String.format(
                "{\"totalTickets\":%d,\"resolvedTickets\":%d,\"stabilityScore\":%.2f,\"highPriorityTickets\":%d}",
                response.getTotalTickets(),
                response.getResolvedTickets(),
                response.getSystemStabilityScore(),
                response.getHighPriorityTickets()
        );
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void generateAutomaticDailyReport() {
        log.info("Generating automatic daily report for Architect...");
        LocalDateTime periodEnd = LocalDateTime.now();
        LocalDateTime periodStart = periodEnd.minusHours(24);
        generateDailyReportForArchitect(periodStart, periodEnd);
    }
}
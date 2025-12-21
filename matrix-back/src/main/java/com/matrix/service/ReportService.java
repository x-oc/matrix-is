package com.matrix.service;

import com.matrix.entity.primary.Report;
import com.matrix.repository.ReportRepository;
import com.matrix.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    public Report generateDailyReport(LocalDateTime periodStart, LocalDateTime periodEnd) {
        log.info("Generating daily report for period: {} - {}", periodStart, periodEnd);

        // Collect statistics
        Map<String, Object> reportData = new HashMap<>();

        long totalTickets = ticketRepository.findByPeriod(periodStart, periodEnd).size();
        long closedTickets = ticketRepository.countByStatus("закрыт");
        long pendingTickets = ticketRepository.countByStatus("на проверке");

        // Count by threat level
        Map<Integer, Long> threatLevelStats = new HashMap<>();
        for (int i = 1; i <= 3; i++) {
            long count = ticketRepository.findByThreatLevel(i).stream()
                    .filter(t -> t.getCreatedAt().isAfter(periodStart) && t.getCreatedAt().isBefore(periodEnd))
                    .count();
            threatLevelStats.put(i, count);
        }

        // Build JSON data
        String jsonData = buildJsonReport(totalTickets, closedTickets, pendingTickets, threatLevelStats);

        Report report = new Report();
        report.setPeriodStart(periodStart);
        report.setPeriodEnd(periodEnd);
        report.setGeneratedData(jsonData);
        report.setCreatedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }

    private String buildJsonReport(long totalTickets, long closedTickets, long pendingTickets,
                                   Map<Integer, Long> threatLevelStats) {
        // Simple JSON construction - in production use Jackson
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"total_tickets\":").append(totalTickets).append(",");
        json.append("\"closed_tickets\":").append(closedTickets).append(",");
        json.append("\"pending_tickets\":").append(pendingTickets).append(",");
        json.append("\"tickets_by_threat_level\":{");

        boolean first = true;
        for (Map.Entry<Integer, Long> entry : threatLevelStats.entrySet()) {
            if (!first) json.append(",");
            json.append("\"").append(entry.getKey()).append("\":").append(entry.getValue());
            first = false;
        }
        json.append("}");
        json.append("}");

        return json.toString();
    }

    @Transactional(readOnly = true)
    public Report getLatestReport() {
        return reportRepository.findAll().stream()
                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                .findFirst()
                .orElse(null);
    }
}
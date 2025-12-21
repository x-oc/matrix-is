package com.matrix.service;

import com.matrix.dto.response.DashboardSummaryResponse;
import com.matrix.entity.enums.TicketStatusEnum;
import com.matrix.entity.enums.UnitStatusEnum;
import com.matrix.repository.TicketRepository;
import com.matrix.repository.UnitRepository;
import com.matrix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final ReportService reportService;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        DashboardSummaryResponse response = new DashboardSummaryResponse();

        long totalTickets = ticketRepository.count();
        long openTickets = ticketRepository.countByStatus(TicketStatusEnum.NEW) +
                ticketRepository.countByStatus(TicketStatusEnum.IN_PROGRESS);
        long highPriorityTickets = ticketRepository.findAll().stream()
                .filter(t -> t.getImportanceLevel() != null &&
                        t.getImportanceLevel().name().equals("HIGH"))
                .count();

        long totalCandidates = unitRepository.findByStatus(UnitStatusEnum.CANDIDATE).size();
        long awakenedUnits = unitRepository.findByStatus(UnitStatusEnum.AWAKENED).size();

        response.setTotalTickets(totalTickets);
        response.setOpenTickets(openTickets);
        response.setHighPriorityTickets(highPriorityTickets);
        response.setTotalCandidates(totalCandidates);
        response.setAwakenedUnits(awakenedUnits);
        response.setActiveUsers(userRepository.findByIsActive(true).size());
        response.setGeneratedAt(LocalDateTime.now());

        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getTicketStatusStatistics() {
        Map<String, Long> stats = new HashMap<>();
        for (TicketStatusEnum status : TicketStatusEnum.values()) {
            Long count = ticketRepository.countByStatus(status);
            stats.put(status.name(), count != null ? count : 0L);
        }
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getCandidateStatistics() {
        Map<String, Long> stats = new HashMap<>();
        for (UnitStatusEnum status : UnitStatusEnum.values()) {
            long count = unitRepository.findByStatus(status).size();
            stats.put(status.name(), count);
        }
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSystemHealthMetrics() {
        Map<String, Object> health = new HashMap<>();

        double stabilityScore = calculateStabilityScore();
        health.put("stabilityScore", stabilityScore);
        health.put("isStable", stabilityScore > 75.0);
        health.put("lastAuditTime", LocalDateTime.now().minusHours(2));
        health.put("pointOfNoReturn", stabilityScore < 60.0);

        return health;
    }

    private double calculateStabilityScore() {
        long totalTickets = ticketRepository.count();
        long resolvedTickets = ticketRepository.countByStatus(TicketStatusEnum.CLOSED);

        if (totalTickets == 0) return 100.0;
        return (resolvedTickets / (double) totalTickets) * 100.0;
    }
}
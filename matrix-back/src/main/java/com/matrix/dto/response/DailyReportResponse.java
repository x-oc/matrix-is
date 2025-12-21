package com.matrix.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class DailyReportResponse {
    private Long reportId;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Integer totalTickets;
    private Integer resolvedTickets;
    private Integer pendingTickets;
    private Integer highPriorityTickets;
    private Map<String, Integer> ticketsByThreatLevel;
    private Double systemStabilityScore;
    private LocalDateTime generatedAt;
}
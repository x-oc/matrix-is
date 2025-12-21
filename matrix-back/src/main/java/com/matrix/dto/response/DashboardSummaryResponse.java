package com.matrix.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DashboardSummaryResponse {
    private Long totalTickets;
    private Long openTickets;
    private Long highPriorityTickets;
    private Long totalCandidates;
    private Long awakenedUnits;
    private Integer activeUsers;
    private LocalDateTime generatedAt;
}
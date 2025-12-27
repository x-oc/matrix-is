package com.matrix.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class ReportResponse {
    private Long id;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private String generatedData;
    private LocalDateTime createdAt;
}

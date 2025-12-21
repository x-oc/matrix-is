package com.matrix.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OracleRequestDto {
    private Long id;
    private Long matrixIterationId;
    private Long unitId;
    private String unitStatus;
    private String status;
    private Long requestedById;
    private String requestedByUsername;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
    private String forecast;
}
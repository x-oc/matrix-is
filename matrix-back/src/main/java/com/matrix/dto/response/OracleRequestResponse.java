package com.matrix.dto.response;

import com.matrix.entity.enums.OracleRequestStatusEnum;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class OracleRequestResponse {
    private Long id;
    private Long matrixIterationId;
    private Long unitId;
    private OracleRequestStatusEnum status;
    private Long requestedBy;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
    private ForecastResponse forecast;
}

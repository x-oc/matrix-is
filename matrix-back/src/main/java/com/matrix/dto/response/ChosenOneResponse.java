package com.matrix.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class ChosenOneResponse {
    private Long id;
    private Long unitId;
    private Boolean restrictionsLifted;
    private String finalDecision;
    private Long selectedBy;
    private Long userId;
    private Long matrixIterationId;
    private LocalDateTime selectedAt;
}

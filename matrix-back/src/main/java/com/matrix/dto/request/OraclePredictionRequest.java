package com.matrix.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OraclePredictionRequest {
    @NotNull
    private Long unitId;

    @NotNull
    private Long requestedBy;

    private String additionalContext;
}
package com.matrix.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OracleProcessPredictionRequest {
    @NotNull
    private Long requestId;

    private String recommendedAction;
}

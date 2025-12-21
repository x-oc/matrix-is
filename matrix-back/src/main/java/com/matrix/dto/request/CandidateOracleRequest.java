package com.matrix.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class CandidateOracleRequest {
    @NotNull(message = "Unit ID is required")
    private Long unitId;

    @NotNull(message = "Requester ID is required")
    private Long requestedBy;
}
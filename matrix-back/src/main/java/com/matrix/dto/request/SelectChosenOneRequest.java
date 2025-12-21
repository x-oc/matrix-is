package com.matrix.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class SelectChosenOneRequest {
    @NotNull(message = "Unit ID is required")
    private Long unitId;

    @NotNull(message = "Selected by user ID is required")
    private Long selectedBy;

    @NotNull(message = "Matrix iteration ID is required")
    private Long matrixIterationId;
}
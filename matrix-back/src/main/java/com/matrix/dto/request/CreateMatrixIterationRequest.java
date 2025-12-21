package com.matrix.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class CreateMatrixIterationRequest {
    @NotNull(message = "Iteration number is required")
    private Integer num;

    @NotBlank(message = "Description is required")
    private String description;
}
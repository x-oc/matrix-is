package com.matrix.dto.request;

import com.matrix.entity.enums.AnomalyTypeEnum;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateTicketRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be less than 200 characters")
    private String title;

    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;

    @Min(value = 1, message = "Threat level must be between 1 and 3")
    @Max(value = 3, message = "Threat level must be between 1 and 3")
    private Integer threatLevel;

    @NotNull(message = "Anomaly type is required")
    private AnomalyTypeEnum anomalyType;

    @NotBlank(message = "Matrix coordinates are required")
    private String matrixCoordinates;
}
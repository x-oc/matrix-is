package com.matrix.dto.request;

import com.matrix.entity.enums.AnomalyTypeEnum;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateGlitchTicketRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Anomaly type is required")
    private AnomalyTypeEnum anomalyType;

    @NotBlank(message = "Coordinates are required")
    private String coordinates;

    @NotNull(message = "Threat level is required")
    @Min(1)
    @Max(3)
    private Integer threatLevel;

    private Integer affectedUnitsCount;
}
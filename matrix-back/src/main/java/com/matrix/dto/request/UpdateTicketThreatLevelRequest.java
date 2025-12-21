package com.matrix.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Data;

@Data
public class UpdateTicketThreatLevelRequest {
    @NotNull(message = "Threat level is required")
    @Min(1)
    @Max(3)
    private Integer threatLevel;
}
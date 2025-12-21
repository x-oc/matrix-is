package com.matrix.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class SentinelStrikeRequest {
    @NotBlank(message = "Target coordinates are required")
    private String targetCoordinates;

    @NotNull(message = "Sentinel count is required")
    private Integer sentinelCount;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotNull(message = "Requester ID is required")
    private Long requestedById;
}
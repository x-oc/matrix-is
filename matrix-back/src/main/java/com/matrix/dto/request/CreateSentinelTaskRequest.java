package com.matrix.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class CreateSentinelTaskRequest {
    @NotNull(message = "Created by user ID is required")
    private Long createdBy;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Sentinel count is required")
    private Integer sentinelCount;

    @NotNull(message = "Location ID is required")
    private Long locationId;

    private String description;
}
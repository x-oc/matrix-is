package com.matrix.dto.request;

import com.matrix.entity.enums.SentinelTaskStatusEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateSentinelTaskRequest {
    @NotNull(message = "Created by user ID is required")
    private Long createdBy;

    @NotNull(message = "Status is required")
    private SentinelTaskStatusEnum status;

    @NotNull(message = "Sentinel count is required")
    private Integer sentinelCount;

    @NotNull(message = "Location ID is required")
    private Long locationId;

    private String description;
}
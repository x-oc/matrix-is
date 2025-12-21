package com.matrix.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class UpdateTicketStatusRequest {
    @NotBlank(message = "Status is required")
    private String status;
}

package com.matrix.dto.request;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class AssignTicketRequest {
    @NotBlank(message = "Role name is required")
    private String assignedToRole;
}
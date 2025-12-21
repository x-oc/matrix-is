package com.matrix.dto.request;

import com.matrix.entity.enums.RoleEnum;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTicketRequest {
    @NotNull(message = "Role is required")
    private RoleEnum assignedToRole;
}
package com.matrix.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class CreateMechanicPermissionRequest {
    @NotNull
    private Long userId;

    @NotNull
    private Long sectorId;

    @NotNull
    private LocalDateTime permissionStart;

    @NotNull
    private LocalDateTime permissionEnd;
}
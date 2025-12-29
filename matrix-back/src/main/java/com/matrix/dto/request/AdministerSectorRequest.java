package com.matrix.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class AdministerSectorRequest {
    @NotNull(message = "Sector ID is required")
    private Long sectorId;

    @NotBlank(message = "Patch code is required")
    private String patchCode;

}
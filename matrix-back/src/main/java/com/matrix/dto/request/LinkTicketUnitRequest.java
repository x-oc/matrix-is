package com.matrix.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class LinkTicketUnitRequest {
    @NotNull
    private Long ticketId;

    @NotNull
    private Long unitId;

    @NotBlank
    private String status;
}
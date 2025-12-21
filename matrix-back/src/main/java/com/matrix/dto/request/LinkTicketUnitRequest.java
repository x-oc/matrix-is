package com.matrix.dto.request;

import com.matrix.entity.enums.TicketUnitStatusEnum;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LinkTicketUnitRequest {
    @NotNull
    private Long ticketId;

    @NotNull
    private Long unitId;

    @NotNull
    private TicketUnitStatusEnum status;
}
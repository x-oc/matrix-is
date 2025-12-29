package com.matrix.dto.response;

import com.matrix.entity.enums.TicketUnitStatusEnum;
import com.matrix.entity.enums.UnitStatusEnum;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UnitShortResponse {
    private Long id;
    private Double disagreementIndex;
    private UnitStatusEnum status;
    private TicketUnitStatusEnum ticketUnitStatus;
    private String dossier;
}
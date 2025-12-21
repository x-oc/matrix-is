package com.matrix.dto.response;

import com.matrix.entity.enums.AnomalyTypeEnum;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.TicketImportanceEnum;
import com.matrix.entity.enums.TicketStatusEnum;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Long id;
    private String title;
    private String description;
    private Integer threatLevel;
    private TicketImportanceEnum importanceLevel;
    private RoleEnum assignedToRole;
    private AnomalyTypeEnum anomalyType;
    private String matrixCoordinates;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private TicketStatusEnum status;
}
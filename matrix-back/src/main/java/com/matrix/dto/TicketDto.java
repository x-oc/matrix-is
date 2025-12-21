package com.matrix.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketDto {
    private Long id;
    private String title;
    private String description;
    private Integer threatLevel;
    private String importanceLevel;
    private Long assignedToRoleId;
    private String assignedToRoleName;
    private Long anomalyTypeId;
    private String anomalyTypeName;
    private String matrixCoordinates;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;
    private Integer affectedUnitsCount;
}
package com.matrix.dto.mappers;

import com.matrix.dto.response.*;
import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.entity.auxiliary.RealLocation;
import com.matrix.entity.auxiliary.Sector;
import com.matrix.entity.linking.TicketComment;
import com.matrix.entity.primary.*;
import lombok.experimental.UtilityClass;

@UtilityClass
public class CommonMapper {

    public UnitResponse map(Unit unit) {
        return UnitResponse.builder()
                .id(unit.getId())
                .disagreementIndex(unit.getDisagreementIndex())
                .dossier(unit.getDossier())
                .statusUpdateAt(unit.getStatusUpdateAt())
                .status(unit.getStatus())
                .realLocation(map(unit.getRealLocation()))
                .build();
    }

    public RealLocationResponse map(RealLocation realLocation) {
        return RealLocationResponse.builder()
                .id(realLocation.getId())
                .latitude(realLocation.getLatitude())
                .longitude(realLocation.getLongitude())
                .z(realLocation.getZ())
                .build();
    }

    public OracleRequestResponse map(OracleRequest oracleRequest) {
        return OracleRequestResponse.builder()
                .id(oracleRequest.getId())
                .matrixIterationId(oracleRequest.getMatrixIteration().getId())
                .unitId(oracleRequest.getUnit().getId())
                .status(oracleRequest.getStatus())
                .requestedBy(oracleRequest.getRequestedBy().getId())
                .processedAt(oracleRequest.getProcessedAt())
                .createdAt(oracleRequest.getCreatedAt())
                .forecast(map(oracleRequest.getForecast()))
                .build();
    }

    public ForecastResponse map(Forecast forecast) {
        return ForecastResponse.builder()
                .id(forecast.getId())
                .forecast(forecast.getForecast())
                .createdAt(forecast.getCreatedAt())
                .build();
    }

    public UserResponse map(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .isActive(user.getIsActive())
                .build();
    }

    public ChosenOneResponse map(ChosenOne chosenOne) {
        return ChosenOneResponse.builder()
                .id(chosenOne.getId())
                .unitId(chosenOne.getUnit().getId())
                .restrictionsLifted(chosenOne.getRestrictionsLifted())
                .finalDecision(chosenOne.getFinalDecision())
                .selectedBy(chosenOne.getSelectedBy().getId())
                .userId(chosenOne.getUser().getId())
                .matrixIterationId(chosenOne.getMatrixIteration().getId())
                .selectedAt(chosenOne.getSelectedAt())
                .build();
    }

    public SentinelTaskResponse map(SentinelTask sentinelTask) {
        return SentinelTaskResponse.builder()
                .id(sentinelTask.getId())
                .createdBy(sentinelTask.getCreatedBy().getId())
                .status(sentinelTask.getStatus())
                .createdAt(sentinelTask.getCreatedAt())
                .sentinelCount(sentinelTask.getSentinelCount())
                .location(map(sentinelTask.getLocation()))
                .description(sentinelTask.getDescription())
                .build();

    }

    public ReportResponse map(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .periodStart(report.getPeriodStart())
                .periodEnd(report.getPeriodEnd())
                .generatedData(report.getGeneratedData())
                .createdAt(report.getCreatedAt())
                .build();
    }

    public SystemAuditResponse map(SystemAudit systemAudit) {
        return SystemAuditResponse.builder()
                .id(systemAudit.getId())
                .auditType(systemAudit.getAuditType())
                .stabilityScore(systemAudit.getStabilityScore())
                .pointOfNoReturn(systemAudit.getPointOfNoReturn())
                .initiatedBy(systemAudit.getInitiatedBy().getId())
                .auditData(systemAudit.getAuditData())
                .createdAt(systemAudit.getCreatedAt())
                .build();
    }

    public TicketResponse map(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .threatLevel(ticket.getThreatLevel())
                .importanceLevel(ticket.getImportanceLevel())
                .assignedToRole(ticket.getAssignedToRole())
                .anomalyType(ticket.getAnomalyType())
                .matrixCoordinates(ticket.getMatrixCoordinates())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .status(ticket.getStatus())
                .build();
    }

    public TicketCommentResponse map(TicketComment ticketComment) {
        return TicketCommentResponse.builder()
                .id(ticketComment.getId())
                .createdAt(ticketComment.getCreatedAt())
                .createdBy(ticketComment.getCreatedBy().getId())
                .ticketId(ticketComment.getTicket().getId())
                .comment(ticketComment.getComment())
                .build();
    }

    public MatrixIterationResponse map(MatrixIteration matrixIteration) {
        return MatrixIterationResponse.builder()
                .id(matrixIteration.getId())
                .num(matrixIteration.getNum())
                .description(matrixIteration.getDescription())
                .build();
    }

    public SectorResponse map(Sector sector) {
        return SectorResponse.builder()
                .id(sector.getId())
                .code(sector.getCode())
                .build();
    }

    public MessageResponse map(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .toUser(message.getToUser().getId())
                .fromUser(message.getFromUser().getId())
                .sentAt(message.getSentAt())
                .build();
    }
}

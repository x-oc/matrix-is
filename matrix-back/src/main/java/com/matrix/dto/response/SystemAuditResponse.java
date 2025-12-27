package com.matrix.dto.response;

import com.matrix.entity.enums.AuditTypeEnum;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SystemAuditResponse {
    private Long id;
    private AuditTypeEnum auditType;
    private Integer stabilityScore;
    private Boolean pointOfNoReturn;
    private Long initiatedBy;
    private String auditData;
    private LocalDateTime createdAt;
}
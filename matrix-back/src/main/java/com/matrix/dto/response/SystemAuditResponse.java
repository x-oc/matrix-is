package com.matrix.dto.response;

import com.matrix.entity.enums.AuditResultEnum;
import com.matrix.entity.enums.AuditStatusEnum;
import com.matrix.entity.enums.AuditTypeEnum;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class SystemAuditResponse {
    private Long auditId;
    private AuditTypeEnum auditType;
    private AuditStatusEnum status;
    private Integer stabilityScore;
    private Boolean pointOfNoReturn;
    private AuditResultEnum result;
    private Map<String, Object> auditData;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String initiatedBy;
}
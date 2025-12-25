package com.matrix.entity.primary;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.matrix.entity.enums.AuditStatusEnum;
import com.matrix.entity.enums.AuditTypeEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_audits")
@Getter
@Setter
public class SystemAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "audit_type", nullable = false, columnDefinition = "audit_type_enum")
    private AuditTypeEnum auditType;

    @Column(name = "stability_score", nullable = false)
    private Integer stabilityScore;

    @Column(name = "point_of_no_return")
    private Boolean pointOfNoReturn;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by", nullable = false)
    private User initiatedBy;

    @Column(name = "audit_data", nullable = false, columnDefinition = "TEXT")
    private String auditData;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false, columnDefinition = "audit_status_enum")
    private AuditStatusEnum status;
}
package com.matrix.entity.primary;

import com.matrix.entity.auxiliary.AuditType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_audits")
@Getter
@Setter
public class SystemAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_type_id", nullable = false)
    private AuditType auditType;

    @Column(name = "stability_score", nullable = false)
    private Integer stabilityScore;

    @Column(name = "point_of_no_return")
    private Boolean pointOfNoReturn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by", nullable = false)
    private User initiatedBy;

    @Column(name = "audit_data", nullable = false, columnDefinition = "TEXT")
    private String auditData;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "status", nullable = false)
    private String status;
}
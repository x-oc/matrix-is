package com.matrix.entity.primary;

import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.entity.enums.OracleRequestStatusEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "oracle_requests")
@Getter
@Setter
public class OracleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matrix_iteration_id", nullable = false)
    private MatrixIteration matrixIteration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "oracle_request_status_enum")
    private OracleRequestStatusEnum status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "oracleRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private Forecast forecast;
}
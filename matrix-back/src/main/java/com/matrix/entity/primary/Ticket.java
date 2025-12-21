package com.matrix.entity.primary;

import com.matrix.entity.enums.*;
import com.matrix.entity.linking.TicketComment;
import com.matrix.entity.linking.TicketUnit;
import com.matrix.entity.linking.UserTicket;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tickets")
@Getter
@Setter
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "threat_level", nullable = false)
    private Integer threatLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "importance_level", columnDefinition = "ticket_importance_enum")
    private TicketImportanceEnum importanceLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "assigned_to_role", nullable = false, columnDefinition = "role_enum")
    private RoleEnum assignedToRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "anomaly_type", nullable = false, columnDefinition = "anomaly_type_enum")
    private AnomalyTypeEnum anomalyType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Report report;

    @Column(name = "matrix_coordinates", nullable = false)
    private String matrixCoordinates;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ticket_status_enum")
    private TicketStatusEnum status;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserTicket> assignedUsers = new HashSet<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TicketUnit> affectedUnits = new HashSet<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TicketComment> comments = new HashSet<>();
}
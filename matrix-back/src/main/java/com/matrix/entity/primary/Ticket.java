package com.matrix.entity.primary;

import com.matrix.entity.auxiliary.AnomalyType;
import com.matrix.entity.auxiliary.Role;
import com.matrix.entity.linking.TicketComment;
import com.matrix.entity.linking.TicketUnit;
import com.matrix.entity.linking.UserTicket;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
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

    @Column(name = "importance_level")
    private String importanceLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_role_id", nullable = false)
    private Role assignedToRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anomaly_type_id", nullable = false)
    private AnomalyType anomalyType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Report report;

    @Column(name = "matrix_coordinates", nullable = false)
    private String matrixCoordinates;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "status", nullable = false)
    private String status;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserTicket> assignedUsers = new HashSet<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TicketUnit> affectedUnits = new HashSet<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TicketComment> comments = new HashSet<>();
}
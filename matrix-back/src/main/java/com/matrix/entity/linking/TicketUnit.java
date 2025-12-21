package com.matrix.entity.linking;

import com.matrix.entity.enums.TicketUnitStatusEnum;
import com.matrix.entity.primary.Ticket;
import com.matrix.entity.primary.Unit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tickets_units")
@Getter
@Setter
public class TicketUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ticket_unit_status_enum")
    private TicketUnitStatusEnum status;
}
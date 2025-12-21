package com.matrix.entity.primary;

import com.matrix.entity.auxiliary.RealLocation;
import com.matrix.entity.enums.UnitStatusEnum;
import com.matrix.entity.linking.TicketUnit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "units")
@Getter
@Setter
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "disagreement_index", nullable = false, precision = 3, scale = 1)
    private Double disagreementIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "unit_status_enum")
    private UnitStatusEnum status;

    @Column(name = "dossier")
    private String dossier;

    @Column(name = "status_update_at")
    private LocalDateTime statusUpdateAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "real_location_id")
    private RealLocation realLocation;

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TicketUnit> ticketUnits = new HashSet<>();

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OracleRequest> oracleRequests = new HashSet<>();

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChosenOne> chosenOnes = new HashSet<>();
}
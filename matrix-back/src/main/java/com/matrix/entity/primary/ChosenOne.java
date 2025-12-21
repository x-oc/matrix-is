package com.matrix.entity.primary;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.matrix.entity.auxiliary.MatrixIteration;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "chosen_ones")
@Getter
@Setter
public class ChosenOne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(name = "restrictions_lifted")
    private Boolean restrictionsLifted;

    @Column(name = "final_decision")
    private String finalDecision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_by", nullable = false)
    private User selectedBy;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matrix_iteration_id", nullable = false)
    private MatrixIteration matrixIteration;

    @Column(name = "selected_at", nullable = false)
    private LocalDateTime selectedAt;
}
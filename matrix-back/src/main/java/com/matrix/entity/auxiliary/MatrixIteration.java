package com.matrix.entity.auxiliary;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "matrix_iterations")
@Getter
@Setter
public class MatrixIteration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "num", nullable = false)
    private Integer num;

    @Column(name = "description")
    private String description;
}
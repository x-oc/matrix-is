package com.matrix.entity.primary;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "forecasts")
@Getter
@Setter
public class Forecast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oracle_request_id", nullable = false)
    private OracleRequest oracleRequest;

    @Column(name = "forecast", nullable = false, columnDefinition = "TEXT")
    private String forecast;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}

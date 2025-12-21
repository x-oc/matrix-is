package com.matrix.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UnitDto {
    private Long id;
    private Double disagreementIndex;
    private String status;
    private String dossier;
    private LocalDateTime statusUpdateAt;
    private Long realLocationId;
    private String realLocationCoords;
}
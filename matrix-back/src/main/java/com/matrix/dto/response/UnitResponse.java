package com.matrix.dto.response;

import com.matrix.entity.enums.UnitStatusEnum;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class UnitResponse {
    private Long id;
    private Double disagreementIndex;
    private UnitStatusEnum status;
    private String dossier;
    private LocalDateTime statusUpdateAt;
    private RealLocationResponse realLocation;
}

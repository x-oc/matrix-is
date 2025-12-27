package com.matrix.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SectorResponse {
    private Long id;
    private String code;
}

package com.matrix.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class RealLocationResponse {
    private Long id;
    private Double latitude;
    private Double longitude;
    private Double z;
}

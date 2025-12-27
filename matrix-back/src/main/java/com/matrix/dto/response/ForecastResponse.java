package com.matrix.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class ForecastResponse {
    private Long id;
    private String forecast;
    private LocalDateTime createdAt;
}

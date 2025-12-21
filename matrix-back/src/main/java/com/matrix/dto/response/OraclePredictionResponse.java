package com.matrix.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class OraclePredictionResponse {
    private Long requestId;
    private Long unitId;
    private String unitName;
    private String prediction;
    private Map<String, Double> actionProbabilities;
    private Double successRate;
    private String recommendedAction;
    private LocalDateTime createdAt;
}
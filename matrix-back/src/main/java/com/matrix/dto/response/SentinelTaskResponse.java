package com.matrix.dto.response;

import com.matrix.entity.enums.SentinelTaskStatusEnum;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SentinelTaskResponse {
    private Long id;
    private Long createdBy;
    private SentinelTaskStatusEnum status;
    private LocalDateTime createdAt;
    private Integer sentinelCount;
    private RealLocationResponse location;
    private String description;
}

package com.matrix.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class MatrixIterationResponse {
    private Long id;
    private Integer num;
    private String description;
}

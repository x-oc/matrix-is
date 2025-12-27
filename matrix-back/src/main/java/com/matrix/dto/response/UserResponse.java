package com.matrix.dto.response;

import com.matrix.entity.enums.RoleEnum;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class UserResponse {
    private Long id;
    private String username;
    private RoleEnum role;
    private LocalDateTime createdAt;
    private Boolean isActive;

}

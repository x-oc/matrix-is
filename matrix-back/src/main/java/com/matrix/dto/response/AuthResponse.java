package com.matrix.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String role;
    private LocalDateTime expiresAt;
}
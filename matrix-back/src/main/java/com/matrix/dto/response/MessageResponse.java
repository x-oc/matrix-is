package com.matrix.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class MessageResponse {
    private Long id;
    private Long fromUser;
    private Long toUser;
    private String text;
    private LocalDateTime sentAt;
}

package com.matrix.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketCommentResponse {
    private Long id;
    private Long createdBy;
    private Long ticketId;
    private String comment;
    private LocalDateTime createdAt;
}

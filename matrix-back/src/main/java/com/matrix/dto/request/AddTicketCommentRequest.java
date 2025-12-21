package com.matrix.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class AddTicketCommentRequest {
    @NotNull(message = "Ticket ID is required")
    private Long ticketId;

    @NotNull(message = "Created by user ID is required")
    private Long createdBy;

    @NotBlank(message = "Comment is required")
    private String comment;
}
package com.matrix.controller;

import com.matrix.dto.request.AddTicketCommentRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.linking.TicketComment;
import com.matrix.service.TicketCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ticket-comments")
@RequiredArgsConstructor
public class TicketCommentController extends BaseController {

    private final TicketCommentService commentService;

    @PostMapping
    public ResponseEntity<ApiResponse<TicketComment>> addComment(@Valid @RequestBody AddTicketCommentRequest request) {
        TicketComment comment = commentService.addComment(
                request.getTicketId(),
                request.getCreatedBy(),
                request.getComment()
        );
        return created("Comment added", comment);
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<ApiResponse<List<TicketComment>>> getCommentsForTicket(@PathVariable Long ticketId) {
        List<TicketComment> comments = commentService.getCommentsForTicket(ticketId);
        return success(comments);
    }
}
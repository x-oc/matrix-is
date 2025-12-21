package com.matrix.controller;

import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.TicketStatusEnum;
import com.matrix.entity.primary.Ticket;
import com.matrix.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ticket-workflow")
@RequiredArgsConstructor
public class TicketWorkflowController extends BaseController {

    private final TicketService ticketService;

    @PutMapping("/{ticketId}/start-work")
    public ResponseEntity<ApiResponse<Void>> startWork(
            @PathVariable Long ticketId,
            @RequestParam Long userId) {
        ticketService.updateStatus(ticketId, TicketStatusEnum.IN_PROGRESS);
        return success("Ticket status changed to 'In Progress'");
    }

    @PutMapping("/{ticketId}/submit-for-review")
    public ResponseEntity<ApiResponse<Void>> submitForReview(
            @PathVariable Long ticketId,
            @RequestParam Long userId) {
        ticketService.updateStatus(ticketId, TicketStatusEnum.UNDER_REVIEW);
        return success("Ticket submitted for review");
    }

    @PutMapping("/{ticketId}/close")
    public ResponseEntity<ApiResponse<Void>> closeTicket(
            @PathVariable Long ticketId,
            @RequestParam Long userId) {
        ticketService.updateStatus(ticketId, TicketStatusEnum.CLOSED);
        return success("Ticket closed");
    }

    @GetMapping("/mechanic/assigned")
    public ResponseEntity<ApiResponse<List<Ticket>>> getAssignedToMechanic() {
        List<Ticket> tickets = ticketService.getTicketsByRoleAndStatus(RoleEnum.MECHANIC, TicketStatusEnum.IN_PROGRESS);
        return success("Tickets assigned to mechanic retrieved", tickets);
    }

    @GetMapping("/agent-smith/assigned")
    public ResponseEntity<ApiResponse<List<Ticket>>> getAssignedToAgentSmith() {
        List<Ticket> tickets = ticketService.getTicketsByRoleAndStatus(RoleEnum.AGENT_SMITH, TicketStatusEnum.IN_PROGRESS);
        return success("Tickets assigned to Agent Smith retrieved", tickets);
    }
}
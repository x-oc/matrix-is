package com.matrix.controller;

import com.matrix.dto.request.AssignTicketRequest;
import com.matrix.dto.request.CreateTicketRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.primary.Ticket;
import com.matrix.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController extends BaseController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<ApiResponse<Ticket>> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        Ticket ticket = ticketService.createTicket(request);
        return created("Ticket created successfully", ticket);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<Ticket>> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketRequest request) {
        Ticket ticket = ticketService.assignTicket(id, request.getAssignedToRole());
        return success("Ticket assigned successfully", ticket);
    }

    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @PathVariable String status) {
        ticketService.updateStatus(id, status);
        return success("Ticket status updated");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Ticket>>> getAllTickets() {
        List<Ticket> tickets = ticketService.findAll();
        return success(tickets);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByStatus(@PathVariable String status) {
        List<Ticket> tickets = ticketService.getTicketsByStatus(status);
        return success(tickets);
    }

    @GetMapping("/role/{roleId}/status/{status}")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByRoleAndStatus(
            @PathVariable Long roleId,
            @PathVariable String status) {
        List<Ticket> tickets = ticketService.getTicketsByRoleAndStatus(roleId, status);
        return success(tickets);
    }

    @PostMapping("/{id}/escalate-mass-glitch")
    public ResponseEntity<ApiResponse<Void>> escalateMassGlitch(@PathVariable Long id) {
        ticketService.escalateMassGlitch(id);
        return success("Mass glitch escalation checked");
    }
}
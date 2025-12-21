package com.matrix.controller;

import com.matrix.dto.request.CreateTicketRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.TicketStatusEnum;
import com.matrix.entity.primary.Ticket;
import com.matrix.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
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
            @RequestParam RoleEnum role) {
        Ticket ticket = ticketService.assignTicket(id, role);
        return success("Ticket assigned successfully", ticket);
    }

    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @PathVariable TicketStatusEnum status) {
        ticketService.updateStatus(id, status);
        return success("Ticket status updated");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Ticket>>> getAllTickets() {
        List<Ticket> tickets = ticketService.findAll();
        return success(tickets);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByStatus(@PathVariable TicketStatusEnum status) {
        List<Ticket> tickets = ticketService.getTicketsByStatus(status);
        return success(tickets);
    }

    @GetMapping("/role/{role}/status/{status}")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByRoleAndStatus(
            @PathVariable RoleEnum role,
            @PathVariable TicketStatusEnum status) {
        List<Ticket> tickets = ticketService.getTicketsByRoleAndStatus(role, status);
        return success(tickets);
    }

    @PostMapping("/{id}/escalate-mass-glitch")
    public ResponseEntity<ApiResponse<Void>> escalateMassGlitch(@PathVariable Long id) {
        ticketService.escalateMassGlitch(id);
        return success("Mass glitch escalation checked");
    }
}
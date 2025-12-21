package com.matrix.controller;

import com.matrix.dto.request.CreateTicketRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.TicketResponse;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.TicketStatusEnum;
import com.matrix.entity.primary.Ticket;
import com.matrix.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController extends BaseController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        Ticket ticket = ticketService.createTicket(request);
        TicketResponse response = convertToResponse(ticket);
        return created("Ticket created successfully", response);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<TicketResponse>> assignTicket(
            @PathVariable Long id,
            @RequestParam RoleEnum role) {
        Ticket ticket = ticketService.assignTicket(id, role);
        TicketResponse response = convertToResponse(ticket);
        return success("Ticket assigned successfully", response);
    }

    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @PathVariable TicketStatusEnum status) {
        ticketService.updateStatus(id, status);
        return success("Ticket status updated");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAllTickets() {
        List<Ticket> tickets = ticketService.findAll();
        List<TicketResponse> responses = tickets.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return success(responses);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsByStatus(@PathVariable TicketStatusEnum status) {
        List<Ticket> tickets = ticketService.getTicketsByStatus(status);
        List<TicketResponse> responses = tickets.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return success(responses);
    }

    @GetMapping("/role/{role}/status/{status}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsByRoleAndStatus(
            @PathVariable RoleEnum role,
            @PathVariable TicketStatusEnum status) {
        List<Ticket> tickets = ticketService.getTicketsByRoleAndStatus(role, status);
        List<TicketResponse> responses = tickets.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return success(responses);
    }

    @PostMapping("/{id}/escalate-mass-glitch")
    public ResponseEntity<ApiResponse<Void>> escalateMassGlitch(@PathVariable Long id) {
        ticketService.escalateMassGlitch(id);
        return success("Mass glitch escalation checked");
    }

    private TicketResponse convertToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setThreatLevel(ticket.getThreatLevel());
        response.setImportanceLevel(ticket.getImportanceLevel());
        response.setAssignedToRole(ticket.getAssignedToRole());
        response.setAnomalyType(ticket.getAnomalyType());
        response.setMatrixCoordinates(ticket.getMatrixCoordinates());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setStatus(ticket.getStatus());
        return response;
    }
}
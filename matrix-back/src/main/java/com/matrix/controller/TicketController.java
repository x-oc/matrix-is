package com.matrix.controller;

import com.matrix.dto.mappers.CommonMapper;
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

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController extends BaseController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        Ticket ticket = ticketService.createTicket(request);
        return created("Ticket created successfully", CommonMapper.map(ticket));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<Void>> assignTicket(
            @PathVariable Long id,
            @RequestParam RoleEnum role) {
        ticketService.assignTicket(id, role);
        return success("Ticket assigned successfully");
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
        return success(tickets.stream().map(CommonMapper::map).toList());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsByStatus(@PathVariable TicketStatusEnum status) {
        List<Ticket> tickets = ticketService.getTicketsByStatus(status);
        return success(tickets.stream().map(CommonMapper::map).toList());
    }

    @PostMapping("/{id}/escalate-mass-glitch")
    public ResponseEntity<ApiResponse<Void>> escalateMassGlitch(@PathVariable Long id) {
        ticketService.escalateMassGlitch(id);
        return success("Mass glitch escalation checked");
    }
}
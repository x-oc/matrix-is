package com.matrix.controller;

import com.matrix.dto.request.CreateGlitchTicketRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.primary.Ticket;
import com.matrix.service.SystemKernelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/kernel")
@RequiredArgsConstructor
public class SystemKernelController extends BaseController {

    private final SystemKernelService systemKernelService;

    @PostMapping("/glitch")
    public ResponseEntity<ApiResponse<Ticket>> createGlitchTicket(
            @Valid @RequestBody CreateGlitchTicketRequest request) {
        Ticket ticket = systemKernelService.createGlitchTicket(request);
        return created("Glitch ticket created automatically", ticket);
    }

    @PostMapping("/candidate")
    public ResponseEntity<ApiResponse<Void>> detectCandidate() {
        systemKernelService.autoDetectAndCreateTickets();
        return success("Candidate detection initiated");
    }

    @PostMapping("/escalate/{ticketId}")
    public ResponseEntity<ApiResponse<Void>> escalateToHighPriority(
            @PathVariable Long ticketId,
            @RequestParam int affectedUnits) {
        systemKernelService.escalateToHighPriority(ticketId, affectedUnits);
        return success("Ticket escalated to high priority");
    }
}
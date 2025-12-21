package com.matrix.controller;

import com.matrix.dto.request.LinkTicketUnitRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.enums.TicketUnitStatusEnum;
import com.matrix.entity.linking.TicketUnit;
import com.matrix.service.TicketUnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ticket-units")
@RequiredArgsConstructor
public class TicketUnitController extends BaseController {

    private final TicketUnitService ticketUnitService;

    @PostMapping("/link")
    public ResponseEntity<ApiResponse<TicketUnit>> linkTicketToUnit(
            @Valid @RequestBody LinkTicketUnitRequest request) {
        TicketUnit ticketUnit = ticketUnitService.linkTicketToUnit(
                request.getTicketId(),
                request.getUnitId(),
                request.getStatus()
        );
        return created("Ticket linked to unit", ticketUnit);
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<ApiResponse<List<TicketUnit>>> getByTicket(@PathVariable Long ticketId) {
        List<TicketUnit> ticketUnits = ticketUnitService.getByTicket(ticketId);
        return success(ticketUnits);
    }

    @GetMapping("/unit/{unitId}")
    public ResponseEntity<ApiResponse<List<TicketUnit>>> getByUnit(@PathVariable Long unitId) {
        List<TicketUnit> ticketUnits = ticketUnitService.getByUnit(unitId);
        return success(ticketUnits);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketUnit>> updateStatus(
            @PathVariable Long id,
            @RequestParam TicketUnitStatusEnum status) {
        TicketUnit ticketUnit = ticketUnitService.updateStatus(id, status);
        return success("Status updated", ticketUnit);
    }

    @GetMapping("/mass-glitch-check/{ticketId}")
    public ResponseEntity<ApiResponse<Boolean>> checkMassGlitch(@PathVariable Long ticketId) {
        boolean isMassGlitch = ticketUnitService.checkMassGlitch(ticketId);
        return success(isMassGlitch);
    }
}
package com.matrix.service;

import com.matrix.dto.request.CreateTicketRequest;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.TicketImportanceEnum;
import com.matrix.entity.enums.TicketStatusEnum;
import com.matrix.entity.primary.Ticket;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.*;
import com.matrix.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService extends BaseService<Ticket, Long> {

    private final TicketRepository ticketRepository;
    private final TicketUnitRepository ticketUnitRepository;
    private final CustomUserDetailsService customUserDetailsService;
    private final DatabaseProcedureService databaseProcedureService;

    @Transactional(readOnly = true)
    public List<Ticket> findAll() {
        RoleEnum role = customUserDetailsService.getRole();

        if (role == RoleEnum.AGENT_SMITH || role == RoleEnum.MECHANIC) {
            return ticketRepository.findByAssignedToRole(role);
        } else {
            return ticketRepository.findAll();
        }
    }

    @Transactional
    public Ticket createTicket(CreateTicketRequest request) {
        log.info("Creating new ticket: {}", request.getTitle());

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setThreatLevel(request.getThreatLevel());
        ticket.setImportanceLevel(TicketImportanceEnum.LOW);
        ticket.setAssignedToRole(RoleEnum.MONITOR);
        ticket.setAnomalyType(request.getAnomalyType());
        ticket.setMatrixCoordinates(request.getMatrixCoordinates());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus(TicketStatusEnum.NEW);

        return ticketRepository.save(ticket);
    }

    @Transactional
    public void assignTicket(Long ticketId, RoleEnum role) {
        RoleEnum curRole = customUserDetailsService.getRole();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (curRole != ticket.getAssignedToRole()) throw new BusinessException("С вашей ролью запрещено менять информацию по тикету");

        databaseProcedureService.assignTicket(ticket.getId(), role);
    }

    @Transactional
    public void updateStatus(Long ticketId, TicketStatusEnum status) {
        RoleEnum role = customUserDetailsService.getRole();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (role != ticket.getAssignedToRole() && role != RoleEnum.ARCHITECT && role != RoleEnum.MONITOR) {
            throw new BusinessException("С вашей ролью запрещено менять информацию по тикету");
        }

        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByStatus(TicketStatusEnum status) {
        RoleEnum role = customUserDetailsService.getRole();

        if (role == RoleEnum.AGENT_SMITH || role == RoleEnum.MECHANIC) {
            return ticketRepository.findByAssignedToRoleAndStatus(role, status);
        } else {
            return ticketRepository.findByStatus(status);
        }
    }

    @Transactional(readOnly = true)
    public long countAffectedUnits(Long ticketId) {
        return ticketUnitRepository.countByTicketId(ticketId);
    }

    @Transactional
    public void escalateMassGlitch(Long ticketId) {
        RoleEnum role = customUserDetailsService.getRole();

        if (role != RoleEnum.MONITOR) throw new BusinessException("С вашей ролью запрещено делать такое действие");

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        long affectedUnits = countAffectedUnits(ticketId);

        if (affectedUnits >= 100) {
            databaseProcedureService.assignTicket(ticket.getId(), RoleEnum.ARCHITECT);
        }
    }
}
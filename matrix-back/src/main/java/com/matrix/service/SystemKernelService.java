package com.matrix.service;

import com.matrix.dto.request.CreateGlitchTicketRequest;
import com.matrix.entity.enums.*;
import com.matrix.entity.primary.Ticket;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.repository.TicketRepository;
import com.matrix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemKernelService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;
    private final MonitoringService monitoringService;

    @Transactional
    public Ticket createGlitchTicket(CreateGlitchTicketRequest request) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setThreatLevel(request.getThreatLevel());
        ticket.setAnomalyType(request.getAnomalyType());
        ticket.setMatrixCoordinates(request.getCoordinates());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus(TicketStatusEnum.NEW);

        if (request.getThreatLevel() == 3) {
            ticket.setImportanceLevel(TicketImportanceEnum.HIGH);
            ticket.setAssignedToRole(RoleEnum.AGENT_SMITH);
        } else if (request.getThreatLevel() == 2) {
            ticket.setImportanceLevel(TicketImportanceEnum.MEDIUM);
            ticket.setAssignedToRole(RoleEnum.MECHANIC);
        } else {
            ticket.setImportanceLevel(TicketImportanceEnum.LOW);
            ticket.setAssignedToRole(RoleEnum.MONITOR);
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        notifyMonitorAboutNewTicket(savedTicket);

        if (request.getAffectedUnitsCount() != null && request.getAffectedUnitsCount() >= 100) {
            escalateToHighPriority(savedTicket.getId(), request.getAffectedUnitsCount());
        }

        return savedTicket;
    }

    private void notifyMonitorAboutNewTicket(Ticket ticket) {
        List<User> monitors = userRepository.findByRole(RoleEnum.MONITOR);
        User systemUser = getSystemUser();

        monitors.stream()
                .filter(User::getIsActive)
                .forEach(monitor ->
                        messageService.sendMessage(
                                systemUser.getId(),
                                monitor.getId(),
                                "New glitch ticket created: #" + ticket.getId() +
                                        " - " + ticket.getTitle() +
                                        " (Threat Level: " + ticket.getThreatLevel() + ")"
                        )
                );
    }

    @Transactional
    public void escalateToHighPriority(Long ticketId, int affectedUnits) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException("Ticket not found"));

        ticket.setImportanceLevel(TicketImportanceEnum.HIGH);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        User systemUser = getSystemUser();
        List<User> monitors = userRepository.findByRole(RoleEnum.MONITOR);

        monitors.stream()
                .filter(User::getIsActive)
                .forEach(monitor ->
                        messageService.sendMessage(
                                systemUser.getId(),
                                monitor.getId(),
                                "MASS GLITCH ALERT: Ticket #" + ticketId +
                                        " escalated to HIGH priority. Affected units: " + affectedUnits
                        )
                );
    }

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void autoDetectAndCreateTickets() {
        log.info("System Kernel: Auto-detecting anomalies...");
    }

    private User getSystemUser() {
        return userRepository.findByUsername("system")
                .orElseGet(() -> {
                    User system = new User();
                    system.setUsername("system");
                    system.setPassword("system_hash_123");
                    system.setRole(RoleEnum.SYSTEM_KERNEL);
                    system.setCreatedAt(LocalDateTime.now());
                    system.setIsActive(true);
                    return userRepository.save(system);
                });
    }
}
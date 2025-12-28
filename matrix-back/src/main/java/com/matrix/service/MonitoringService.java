package com.matrix.service;

import com.matrix.entity.enums.AnomalyTypeEnum;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.TicketImportanceEnum;
import com.matrix.entity.enums.TicketStatusEnum;
import com.matrix.entity.primary.Ticket;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.TicketRepository;
import com.matrix.repository.TicketUnitRepository;
import com.matrix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MonitoringService {

    private final TicketRepository ticketRepository;
    private final TicketUnitRepository ticketUnitRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;

    /**
     * F-101: Автоматическое создание тикета при обнаружении отклонений
     */
    @Transactional
    public Ticket createAutomaticTicket(String title, String description,
                                        Integer threatLevel, AnomalyTypeEnum anomalyType,
                                        String coordinates) {
        Ticket ticket = new Ticket();
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setThreatLevel(threatLevel);
        ticket.setImportanceLevel(TicketImportanceEnum.LOW);
        ticket.setAssignedToRole(RoleEnum.MONITOR);
        ticket.setAnomalyType(anomalyType);
        ticket.setMatrixCoordinates(coordinates);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus(TicketStatusEnum.NEW);

        return ticketRepository.save(ticket);
    }

    /**
     * F-102: Назначение уровня угрозы тикету
     */
    @Transactional
    public Ticket assignThreatLevel(Long ticketId, Integer threatLevel) {
        if (threatLevel < 1 || threatLevel > 3) {
            throw new BusinessException("Уровень угрозы должен быть от 1 до 3");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setThreatLevel(threatLevel);
        ticket.setUpdatedAt(LocalDateTime.now());

        // Автоматическое назначение роли на основе уровня угрозы
        if (threatLevel == 3) {
            ticket.setAssignedToRole(RoleEnum.AGENT_SMITH);
        } else if (threatLevel == 2 || threatLevel == 1) {
            ticket.setAssignedToRole(RoleEnum.MECHANIC);
        }

        return ticketRepository.save(ticket);
    }
}
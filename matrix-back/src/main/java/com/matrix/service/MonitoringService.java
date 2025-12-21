package com.matrix.service;

import com.matrix.entity.enums.AnomalyTypeEnum;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.TicketImportanceEnum;
import com.matrix.entity.enums.TicketStatusEnum;
import com.matrix.entity.linking.TicketUnit;
import com.matrix.entity.primary.Ticket;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.TicketRepository;
import com.matrix.repository.TicketUnitRepository;
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
     * F-103: Автоматическое повышение важности тикета при массовых аномалиях
     */
    @Transactional
    public void checkAndEscalateMassGlitch(Long ticketId) {
        long affectedUnits = ticketUnitRepository.countByTicketId(ticketId);

        if (affectedUnits >= 100) {
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

            if (ticket.getImportanceLevel() != TicketImportanceEnum.HIGH) {
                ticket.setImportanceLevel(TicketImportanceEnum.HIGH);
                ticket.setUpdatedAt(LocalDateTime.now());
                ticketRepository.save(ticket);

                // Уведомление Смотрителя
                User systemUser = userRepository.findByUsername("system")
                        .orElseThrow(() -> new BusinessException("System user not found"));

                List<User> monitors = userRepository.findByRole(RoleEnum.MONITOR);
                monitors.stream()
                        .filter(User::getIsActive)
                        .forEach(monitor ->
                                messageService.sendMessage(
                                        systemUser.getId(),
                                        monitor.getId(),
                                        "Массовый глитч обнаружен! Тикет #" + ticketId +
                                                " повышен до ВЫСОКОЙ важности. Затронуто юнитов: " + affectedUnits
                                )
                        );
            }
        }
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

    /**
     * Ежедневная проверка массовых аномалий
     */
    @Scheduled(cron = "0 0 * * * *") // Каждый час
    @Transactional
    public void checkMassGlitches() {
        List<Ticket> tickets = ticketRepository.findAll();

        for (Ticket ticket : tickets) {
            if (ticket.getStatus() == TicketStatusEnum.NEW ||
                    ticket.getStatus() == TicketStatusEnum.IN_PROGRESS) {
                checkAndEscalateMassGlitch(ticket.getId());
            }
        }
    }
}
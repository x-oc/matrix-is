package com.matrix.service;

import com.matrix.dto.request.CreateTicketRequest;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.TicketImportanceEnum;
import com.matrix.entity.enums.TicketStatusEnum;
import com.matrix.entity.linking.TicketComment;
import com.matrix.entity.primary.Message;
import com.matrix.entity.primary.Ticket;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class TicketService extends BaseService<Ticket, Long> {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketUnitRepository ticketUnitRepository;
    private final MessageRepository messageRepository;
    private final MessageService messageService;
    private final TicketCommentRepository commentRepository;

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         TicketUnitRepository ticketUnitRepository,
                         MessageRepository messageRepository,
                         MessageService messageService,
                         TicketCommentRepository commentRepository) {
        super(ticketRepository);
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.ticketUnitRepository = ticketUnitRepository;
        this.messageRepository = messageRepository;
        this.messageService = messageService;
        this.commentRepository = commentRepository;
    }

    @Transactional(readOnly = true)
    public List<Ticket> findAll() {
        return ticketRepository.findAll();
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
    public Ticket assignTicket(Long ticketId, RoleEnum role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setAssignedToRole(role);
        ticket.setUpdatedAt(LocalDateTime.now());

        User systemUser = userRepository.findByUsername("system")
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(User::getIsActive)
                        .findFirst()
                        .orElse(null));

        if (systemUser != null) {
            TicketComment comment = new TicketComment();
            comment.setCreatedBy(systemUser);
            comment.setTicket(ticket);
            comment.setComment("Тикет назначен на роль: " + role);
            comment.setCreatedAt(LocalDateTime.now());
            commentRepository.save(comment);
        }

        return ticketRepository.save(ticket);
    }

    @Transactional
    public void updateStatus(Long ticketId, TicketStatusEnum status) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByStatus(TicketStatusEnum status) {
        return ticketRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByRoleAndStatus(RoleEnum role, TicketStatusEnum status) {
        return ticketRepository.findByAssignedToRoleAndStatus(role, status);
    }

    @Transactional(readOnly = true)
    public long countAffectedUnits(Long ticketId) {
        return ticketUnitRepository.countByTicketId(ticketId);
    }

    @Transactional
    public void escalateMassGlitch(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        long affectedUnits = countAffectedUnits(ticketId);

        if (affectedUnits >= 100) {
            ticket.setImportanceLevel(TicketImportanceEnum.HIGH);
            ticket.setUpdatedAt(LocalDateTime.now());
            ticketRepository.save(ticket);

            List<User> watchers = userRepository.findByRole(RoleEnum.MONITOR);
            User systemUser = userRepository.findByUsername("system")
                    .orElse(null);

            if (!watchers.isEmpty() && systemUser != null) {
                for (User watcher : watchers) {
                    if (watcher.getIsActive()) {
                        Message message = new Message();
                        message.setFromUser(systemUser);
                        message.setToUser(watcher);
                        message.setText("Обнаружен массовый глитч! Тикет #" + ticketId +
                                " повышен до Высокого уровня важности. Затронуто юнитов: " + affectedUnits);
                        message.setSentAt(LocalDateTime.now());
                        messageRepository.save(message);
                    }
                }
            }
        }
    }

    @Transactional
    public void escalateMassGlitchAutomatically(Long ticketId) {
        long affectedUnits = ticketUnitRepository.countByTicketId(ticketId);

        if (affectedUnits >= 100) {
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

            ticket.setImportanceLevel(TicketImportanceEnum.HIGH);
            ticket.setStatus(TicketStatusEnum.ESCALATED);
            ticket.setUpdatedAt(LocalDateTime.now());
            ticketRepository.save(ticket);

            notifyMonitorsAboutMassGlitch(ticketId, affectedUnits);
        }
    }

    private void notifyMonitorsAboutMassGlitch(Long ticketId, long affectedUnits) {
        List<User> monitors = userRepository.findByRole(RoleEnum.MONITOR);
        User system = userRepository.findByUsername("system")
                .orElseThrow(() -> new BusinessException("System user not found"));

        for (User monitor : monitors) {
            if (monitor.getIsActive()) {
                messageService.sendMessage(
                        system.getId(),
                        monitor.getId(),
                        "MASS GLITCH ALERT: Ticket #" + ticketId +
                                " escalated to HIGH. Affected units: " + affectedUnits
                );
            }
        }
    }
}
package com.matrix.service;
import com.matrix.dto.request.CreateTicketRequest;
import com.matrix.entity.auxiliary.AnomalyType;
import com.matrix.entity.auxiliary.Role;
import com.matrix.entity.linking.TicketComment;
import com.matrix.entity.primary.Message;
import com.matrix.entity.primary.Ticket;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final RoleRepository roleRepository;
    private final AnomalyTypeRepository anomalyTypeRepository;
    private final UserRepository userRepository;
    private final TicketUnitRepository ticketUnitRepository;
    private final MessageRepository messageRepository;
    private final TicketCommentRepository commentRepository;

    @Transactional(readOnly = true)
    public List<Ticket> findAll() {
        return ticketRepository.findAll();
    }

    @Transactional
    public Ticket createTicket(CreateTicketRequest request) {
        log.info("Creating new ticket: {}", request.getTitle());

        Role watcherRole = roleRepository.findByName("Смотритель")
                .orElseThrow(() -> new BusinessException("Watcher role not found"));

        AnomalyType anomalyType = anomalyTypeRepository.findById(request.getAnomalyTypeId())
                .orElseThrow(() -> new BusinessException("Anomaly type not found"));

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setThreatLevel(request.getThreatLevel());
        ticket.setImportanceLevel("Низкий");
        ticket.setAssignedToRole(watcherRole);
        ticket.setAnomalyType(anomalyType);
        ticket.setMatrixCoordinates(request.getMatrixCoordinates());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus("новый");

        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket assignTicket(Long ticketId, String roleName) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new BusinessException("Role not found: " + roleName));

        ticket.setAssignedToRole(role);
        ticket.setUpdatedAt(LocalDateTime.now());

        // Find system user for comment
        User systemUser = userRepository.findByUsername("system")
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(User::getIsActive)
                        .findFirst()
                        .orElse(null));

        if (systemUser != null) {
            TicketComment comment = new TicketComment();
            comment.setCreatedBy(systemUser);
            comment.setTicket(ticket);
            comment.setComment("Тикет назначен на роль: " + roleName);
            comment.setCreatedAt(LocalDateTime.now());
            commentRepository.save(comment);
        }

        return ticketRepository.save(ticket);
    }

    @Transactional
    public void updateStatus(Long ticketId, String status) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByRoleAndStatus(Long roleId, String status) {
        return ticketRepository.findByRoleAndStatus(roleId, status);
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
            ticket.setImportanceLevel("Высокий");
            ticket.setUpdatedAt(LocalDateTime.now());
            ticketRepository.save(ticket);

            // Notify watcher
            User watcher = userRepository.findByRoleName("Смотритель").stream()
                    .filter(User::getIsActive)
                    .findFirst()
                    .orElse(null);

            User systemUser = userRepository.findByUsername("system")
                    .orElse(null);

            if (watcher != null && systemUser != null) {
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
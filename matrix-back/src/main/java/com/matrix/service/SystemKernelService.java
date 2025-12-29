package com.matrix.service;

import com.matrix.entity.enums.*;
import com.matrix.entity.primary.Ticket;
import com.matrix.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemKernelService {

    private final TicketRepository ticketRepository;

    @Scheduled(fixedRate = 300000)
    @Transactional
    public void autoDetectAndCreateTickets() {
        log.info("System Kernel: Auto-detecting anomalies...");

        Ticket testTicket = new Ticket();
        testTicket.setTitle("Автоматически обнаруженный глитч: " + LocalDateTime.now());
        testTicket.setDescription("Глитч обнаружен в секторе " + (int)(Math.random() * 100));
        testTicket.setThreatLevel(1);
        testTicket.setImportanceLevel(TicketImportanceEnum.LOW);
        testTicket.setAssignedToRole(RoleEnum.MONITOR);
        testTicket.setAnomalyType(AnomalyTypeEnum.VISUAL_ARTIFACT);
        testTicket.setMatrixCoordinates("[" + (int)(Math.random() * 1000) + "," + (int)(Math.random() * 1000) + "]");
        testTicket.setCreatedAt(LocalDateTime.now());
        testTicket.setUpdatedAt(LocalDateTime.now());
        testTicket.setStatus(TicketStatusEnum.NEW);

        ticketRepository.save(testTicket);
        log.info("Автоматически создан тестовый тикет #{}", testTicket.getId());
    }
}
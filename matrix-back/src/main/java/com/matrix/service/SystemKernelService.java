package com.matrix.service;

import com.matrix.dto.request.CreateGlitchTicketRequest;
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

        return ticketRepository.save(ticket);
    }

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void autoDetectAndCreateTickets() {
        log.info("System Kernel: Auto-detecting anomalies...");
    }
}
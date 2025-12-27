package com.matrix.service;

import com.matrix.entity.enums.TicketUnitStatusEnum;
import com.matrix.entity.linking.TicketUnit;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.TicketUnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketUnitService {

    private final TicketUnitRepository ticketUnitRepository;

    @Transactional(readOnly = true)
    public List<TicketUnit> getByTicket(Long ticketId) {
        return ticketUnitRepository.findByTicketId(ticketId);
    }

    @Transactional(readOnly = true)
    public List<TicketUnit> getByUnit(Long unitId) {
        return ticketUnitRepository.findByUnitId(unitId);
    }

    @Transactional
    public TicketUnit updateStatus(Long id, TicketUnitStatusEnum status) {
        TicketUnit ticketUnit = ticketUnitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketUnit not found"));

        ticketUnit.setStatus(status);
        return ticketUnitRepository.save(ticketUnit);
    }

    @Transactional(readOnly = true)
    public boolean checkMassGlitch(Long ticketId) {
        Long count = ticketUnitRepository.countByTicketId(ticketId);
        return count != null && count >= 100;
    }
}
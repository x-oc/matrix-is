package com.matrix.repository;

import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.TicketStatusEnum;
import com.matrix.entity.primary.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByStatus(TicketStatusEnum status);
    List<Ticket> findByAssignedToRole(RoleEnum assignedToRole);
    List<Ticket> findByThreatLevel(Integer threatLevel);
    List<Ticket> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    Long countByStatus(TicketStatusEnum status);

    List<Ticket> findByAssignedToRoleAndStatus(RoleEnum role, TicketStatusEnum status);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.importanceLevel = 'HIGH'")
    Long countHighPriorityTickets();
}
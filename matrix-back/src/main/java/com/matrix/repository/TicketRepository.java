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
    List<Ticket> findByImportanceLevel(String importanceLevel);
    List<Ticket> findByThreatLevel(Integer threatLevel);

    @Query("SELECT t FROM Ticket t WHERE t.createdAt BETWEEN :startDate AND :endDate")
    List<Ticket> findByPeriod(@Param("startDate") LocalDateTime startDate,
                              @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status = :status")
    Long countByStatus(@Param("status") TicketStatusEnum status);

    @Query("SELECT t FROM Ticket t WHERE t.assignedToRole = :role AND t.status = :status")
    List<Ticket> findByAssignedToRoleAndStatus(@Param("role") RoleEnum role,
                                               @Param("status") TicketStatusEnum status);
}
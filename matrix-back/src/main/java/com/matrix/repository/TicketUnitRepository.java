package com.matrix.repository;

import com.matrix.entity.linking.TicketUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketUnitRepository extends JpaRepository<TicketUnit, Long> {
    @Query("SELECT COUNT(tu) FROM TicketUnit tu WHERE tu.ticket.id = :ticketId")
    Long countByTicketId(@Param("ticketId") Long ticketId);

    @Query("SELECT tu FROM TicketUnit tu WHERE tu.ticket.id = :ticketId")
    List<TicketUnit> findByTicketId(@Param("ticketId") Long ticketId);

    @Query("SELECT tu FROM TicketUnit tu WHERE tu.unit.id = :unitId")
    List<TicketUnit> findByUnitId(@Param("unitId") Long unitId);

    void deleteByTicketId(Long ticketId);
}
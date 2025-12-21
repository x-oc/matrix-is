package com.matrix.repository;

import com.matrix.entity.linking.TicketUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketUnitRepository extends JpaRepository<TicketUnit, Long> {
    @Query("SELECT COUNT(tu) FROM TicketUnit tu WHERE tu.ticket.id = :ticketId")
    Long countByTicketId(@Param("ticketId") Long ticketId);

    void deleteByTicketId(Long ticketId);
}
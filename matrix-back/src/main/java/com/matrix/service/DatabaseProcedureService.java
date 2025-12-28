package com.matrix.service;


import com.matrix.entity.enums.RoleEnum;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DatabaseProcedureService {

    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public void assignTicket(Long ticketId, RoleEnum role) {
        jdbcTemplate.execute(
                String.format("CALL assign_ticket(%d, '%s')", ticketId, role)
        );
    }

    @Transactional
    public Long generateReportByTime(LocalDateTime periodStart, LocalDateTime periodEnd) {
        return jdbcTemplate.queryForObject(
                "SELECT generate_daily_report(?, ?)",
                Long.class,
                Timestamp.valueOf(periodStart),
                Timestamp.valueOf(periodEnd)
        );
    }
}
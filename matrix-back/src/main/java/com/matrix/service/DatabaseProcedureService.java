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
        jdbcTemplate.update(
                "CALL assign_ticket(?, ?::role_enum)",
                ticketId,
                role.name()
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

    @Transactional
    public void processOraclePrediction(Long requestId, Long oracleId, String forecastText) {
        jdbcTemplate.update(
                "CALL process_oracle_prediction(?, ?, ?)",
                requestId,
                oracleId,
                forecastText
        );
    }

    @Transactional
    public void selectChosenOne(Long unitId, Long selectedById, Long matrixIterationId) {
        jdbcTemplate.update(
                "CALL select_chosen_one(?, ?, ?)",
                unitId,
                selectedById,
                matrixIterationId
        );
    }
}
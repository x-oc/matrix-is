package com.matrix.service;

import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.entity.enums.*;
import com.matrix.entity.primary.OracleRequest;
import com.matrix.entity.primary.Unit;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CandidateService {

    private final UnitRepository unitRepository;
    private final OracleRequestRepository oracleRequestRepository;
    private final MatrixIterationRepository matrixIterationRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;

    @Transactional
    public void detectCandidates() {
        List<Unit> units = unitRepository.findByDisagreementIndexGreaterThan(8.5);

        for (Unit unit : units) {
            if (unit.getStatus() == UnitStatusEnum.NORMAL ||
                    unit.getStatus() == UnitStatusEnum.SUSPICIOUS) {

                // F-202: Создание досье и уведомление
                unit.setStatus(UnitStatusEnum.CANDIDATE);
                unit.setStatusUpdateAt(LocalDateTime.now());
                unitRepository.save(unit);

                // Уведомление Агента Смита и Смотрителя
                notifyAgentsAboutCandidate(unit);

                // Автоматическое создание запроса к Оракулу
                createOracleRequestForCandidate(unit);
            }
        }
    }

    private void notifyAgentsAboutCandidate(Unit unit) {
        User systemUser = userRepository.findByUsername("system")
                .orElseThrow(() -> new BusinessException("System user not found"));

        // Уведомление Агентов Смита
        List<User> agents = userRepository.findByRole(RoleEnum.AGENT_SMITH);
        agents.stream()
                .filter(User::getIsActive)
                .forEach(agent -> {
                    try {
                        messageService.sendMessage(
                                systemUser.getId(),
                                agent.getId(),
                                "Обнаружен кандидат! ID: " + unit.getId() +
                                        ", Индекс несогласия: " + unit.getDisagreementIndex() +
                                        ", Досье: " + unit.getDossier()
                        );
                    } catch (Exception e) {
                        log.error("Failed to send message to agent {}", agent.getId(), e);
                    }
                });

        // Уведомление Смотрителей
        List<User> monitors = userRepository.findByRole(RoleEnum.MONITOR);
        monitors.stream()
                .filter(User::getIsActive)
                .forEach(monitor -> {
                    try {
                        messageService.sendMessage(
                                systemUser.getId(),
                                monitor.getId(),
                                "Кандидат обнаружен: " + unit.getId()
                        );
                    } catch (Exception e) {
                        log.error("Failed to send message to monitor {}", monitor.getId(), e);
                    }
                });
    }

    private void createOracleRequestForCandidate(Unit unit) {
        MatrixIteration currentIteration = matrixIterationRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new BusinessException("No matrix iteration found"));

        User systemUser = userRepository.findByUsername("system")
                .orElseThrow(() -> new BusinessException("System user not found"));

        OracleRequest request = new OracleRequest();
        request.setMatrixIteration(currentIteration);
        request.setUnit(unit);
        request.setStatus(OracleRequestStatusEnum.PENDING);
        request.setRequestedBy(systemUser);
        request.setCreatedAt(LocalDateTime.now());

        oracleRequestRepository.save(request);
    }

    @Transactional
    public OracleRequest requestOraclePrediction(Long unitId, Long requestedById) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found"));

        User requester = userRepository.findById(requestedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MatrixIteration currentIteration = matrixIterationRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new BusinessException("No matrix iteration found"));

        OracleRequest request = new OracleRequest();
        request.setMatrixIteration(currentIteration);
        request.setUnit(unit);
        request.setStatus(OracleRequestStatusEnum.PENDING);
        request.setRequestedBy(requester);
        request.setCreatedAt(LocalDateTime.now());

        return oracleRequestRepository.save(request);
    }

    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void scheduledCandidateDetection() {
        log.info("Запуск автоматического обнаружения кандидатов");
        detectCandidates();
    }
}
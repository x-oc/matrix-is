package com.matrix.service;

import com.matrix.dto.response.SystemAuditResponse;
import com.matrix.entity.enums.*;
import com.matrix.entity.primary.SystemAudit;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.SystemAuditRepository;
import com.matrix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemAuditOrchestrationService {

    private final SystemAuditRepository systemAuditRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;
    private final ChosenOneService chosenOneService;

    @Transactional
    public SystemAudit initiateFullSystemAudit(Long initiatedById) {
        User initiator = userRepository.findById(initiatedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (initiator.getRole() != RoleEnum.ARCHITECT) {
            throw new BusinessException("Only Architect can initiate system audit");
        }

        SystemAudit audit = new SystemAudit();
        audit.setAuditType(AuditTypeEnum.FULL_SYSTEM_AUDIT);
        audit.setStatus(AuditStatusEnum.STARTED);
        audit.setStabilityScore(0);
        audit.setInitiatedBy(initiator);
        audit.setCreatedAt(LocalDateTime.now());
        audit.setAuditData("{}");

        SystemAudit savedAudit = systemAuditRepository.save(audit);

        notifyMonitorsAboutAudit(savedAudit, initiator);

        return savedAudit;
    }

    @Transactional
    public SystemAuditResponse performAudit(Long auditId) {
        SystemAudit audit = systemAuditRepository.findById(auditId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit not found"));

        audit.setStatus(AuditStatusEnum.IN_PROGRESS);
        systemAuditRepository.save(audit);

        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        Random random = new Random();
        int stabilityScore = 70 + random.nextInt(30);

        Map<String, Object> auditData = new HashMap<>();
        auditData.put("sectors_checked", 150);
        auditData.put("anomalies_found", random.nextInt(50));
        auditData.put("avg_latency_ms", 15 + random.nextInt(30));
        auditData.put("unstable_sectors", random.nextInt(20));
        auditData.put("population_awareness", random.nextDouble() * 0.05);

        boolean pointOfNoReturn = stabilityScore < 75;

        audit.setStabilityScore(stabilityScore);
        audit.setPointOfNoReturn(pointOfNoReturn);
        audit.setAuditData(auditData.toString());
        audit.setStatus(AuditStatusEnum.COMPLETED);

        SystemAudit updatedAudit = systemAuditRepository.save(audit);

        return createAuditResponse(updatedAudit);
    }

    @Transactional
    public String getPointOfNoReturnAnalysis(Long auditId) {
        SystemAudit audit = systemAuditRepository.findById(auditId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit not found"));

        if (audit.getStatus() != AuditStatusEnum.COMPLETED) {
            throw new BusinessException("Audit not completed yet");
        }

        if (audit.getPointOfNoReturn()) {
            return "ТОЧКА НЕВОЗВРАТА ДОСТИГНУТА. Стабильность системы: " +
                    audit.getStabilityScore() + "%. Требуется немедленная перезагрузка.";
        } else {
            return "Система стабильна. Текущая стабильность: " +
                    audit.getStabilityScore() + "%. Точка невозврата не достигнута.";
        }
    }

    @Transactional
    public void recommendChosenOneBasedOnAudit(Long auditId) {
        SystemAudit audit = systemAuditRepository.findById(auditId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit not found"));

        if (audit.getStatus() != AuditStatusEnum.COMPLETED) {
            throw new BusinessException("Audit not completed yet");
        }

        if (audit.getPointOfNoReturn()) {
            User architect = userRepository.findByRole(RoleEnum.ARCHITECT)
                    .stream()
                    .filter(User::getIsActive)
                    .findFirst()
                    .orElseThrow(() -> new BusinessException("No active Architect found"));

            User systemUser = userRepository.findByUsername("system")
                    .orElseGet(() -> {
                        User system = new User();
                        system.setUsername("system");
                        system.setPassword("system_hash_123");
                        system.setRole(RoleEnum.SYSTEM_KERNEL);
                        system.setCreatedAt(LocalDateTime.now());
                        system.setIsActive(true);
                        return userRepository.save(system);
                    });

            messageService.sendMessage(
                    systemUser.getId(),
                    architect.getId(),
                    "ТОЧКА НЕВОЗВРАТА достигнута! Стабильность системы: " +
                            audit.getStabilityScore() + "%. Необходимо выбрать Избранного для перезагрузки."
            );
        }
    }

    private void notifyMonitorsAboutAudit(SystemAudit audit, User initiator) {
        List<User> monitors = userRepository.findByRole(RoleEnum.MONITOR);

        monitors.stream()
                .filter(User::getIsActive)
                .forEach(monitor ->
                        messageService.sendMessage(
                                initiator.getId(),
                                monitor.getId(),
                                "СИСТЕМНЫЙ АУДИТ: Запущен полный аудит системы пользователем " +
                                        initiator.getUsername() + ". Возможны задержки в работе."
                        )
                );
    }

    private SystemAuditResponse createAuditResponse(SystemAudit audit) {
        SystemAuditResponse response = new SystemAuditResponse();
        response.setAuditId(audit.getId());
        response.setAuditType(audit.getAuditType());
        response.setStatus(audit.getStatus());
        response.setStabilityScore(audit.getStabilityScore());
        response.setPointOfNoReturn(audit.getPointOfNoReturn());
        response.setStartedAt(audit.getCreatedAt());
        response.setCompletedAt(LocalDateTime.now());
        response.setInitiatedBy(audit.getInitiatedBy().getUsername());

        if (audit.getStabilityScore() >= 90) {
            response.setResult(AuditResultEnum.STABLE);
        } else if (audit.getStabilityScore() >= 75) {
            response.setResult(AuditResultEnum.UNSTABLE);
        } else if (audit.getStabilityScore() >= 60) {
            response.setResult(AuditResultEnum.CRITICAL);
        } else {
            response.setResult(AuditResultEnum.POINT_OF_NO_RETURN);
        }

        return response;
    }
}
package com.matrix.service;

import com.matrix.entity.enums.*;
import com.matrix.entity.primary.SystemAudit;
import com.matrix.entity.primary.User;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.SystemAuditRepository;
import com.matrix.repository.UserRepository;
import com.matrix.security.CustomUserDetailsService;
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
    private final CustomUserDetailsService customUserDetailsService;
    private final ChosenOneService chosenOneService;

    @Transactional
    public SystemAudit initiateFullSystemAudit() {
        customUserDetailsService.checkRoles(List.of(RoleEnum.ARCHITECT));

        User initiator = customUserDetailsService.getUser();

        Random random = new Random();
        int stabilityScore = 70 + random.nextInt(30);

        Map<String, Object> auditData = new HashMap<>();
        auditData.put("sectors_checked", 150);
        auditData.put("anomalies_found", random.nextInt(50));
        auditData.put("avg_latency_ms", 15 + random.nextInt(30));
        auditData.put("unstable_sectors", random.nextInt(20));
        auditData.put("population_awareness", random.nextDouble() * 0.05);

        boolean pointOfNoReturn = stabilityScore < 75;

        SystemAudit audit = new SystemAudit();
        audit.setAuditType(AuditTypeEnum.FULL_SYSTEM_AUDIT);
        audit.setInitiatedBy(initiator);
        audit.setCreatedAt(LocalDateTime.now());
        audit.setStabilityScore(stabilityScore);
        audit.setPointOfNoReturn(pointOfNoReturn);
        audit.setAuditData(auditData.toString());

        SystemAudit savedAudit = systemAuditRepository.save(audit);

        notifyMonitorsAboutAudit(savedAudit, initiator);

        return savedAudit;
    }

    @Transactional
    public String getPointOfNoReturnAnalysis(Long auditId) {
        customUserDetailsService.checkRoles(List.of(RoleEnum.ARCHITECT));

        SystemAudit audit = systemAuditRepository.findById(auditId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit not found"));

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
        customUserDetailsService.checkRoles(List.of(RoleEnum.ARCHITECT));

        User architect = customUserDetailsService.getUser();

        SystemAudit audit = systemAuditRepository.findById(auditId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit not found"));

        if (audit.getPointOfNoReturn()) {
            User systemUser = userRepository.findByUsername("system").orElseThrow(() -> new RuntimeException("Системное Ядро временно недоступно"));

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
}
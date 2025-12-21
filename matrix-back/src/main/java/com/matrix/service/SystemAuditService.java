package com.matrix.service;

import com.matrix.entity.primary.SystemAudit;
import com.matrix.entity.primary.User;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.SystemAuditRepository;
import com.matrix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemAuditService extends BaseService<SystemAudit, Long> {

    private final SystemAuditRepository systemAuditRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;

    @Override
    @Transactional(readOnly = true)
    public List<SystemAudit> findAll() {
        return systemAuditRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public SystemAudit findById(Long id) {
        return systemAuditRepository.findById(id)
                .orElseThrow(() -> new com.matrix.exception.ResourceNotFoundException("SystemAudit not found with id: " + id));
    }

    @Override
    @Transactional
    public SystemAudit save(SystemAudit entity) {
        return systemAuditRepository.save(entity);
    }

    @Transactional
    public SystemAudit initiateAudit(Long auditTypeId, Integer stabilityScore,
                                     Boolean pointOfNoReturn, Long initiatedById,
                                     String auditData, String status) {

        User initiatedBy = userRepository.findById(initiatedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SystemAudit audit = new SystemAudit();
        // audit.setAuditType(auditType); // Would need AuditType entity
        audit.setStabilityScore(stabilityScore);
        audit.setPointOfNoReturn(pointOfNoReturn);
        audit.setInitiatedBy(initiatedBy);
        audit.setAuditData(auditData);
        audit.setCreatedAt(LocalDateTime.now());
        audit.setStatus(status);

        // Notify all watchers
        notifyWatchersAboutAudit(initiatedBy);

        return systemAuditRepository.save(audit);
    }

    @Transactional
    public void updateAuditStatus(Long auditId, String status, Integer stabilityScore) {
        SystemAudit audit = findById(auditId);
        audit.setStatus(status);
        if (stabilityScore != null) {
            audit.setStabilityScore(stabilityScore);
        }
        systemAuditRepository.save(audit);
    }

    @Transactional(readOnly = true)
    public List<SystemAudit> getAuditsByStatus(String status) {
        return systemAuditRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<SystemAudit> getAuditsByInitiator(Long userId) {
        return systemAuditRepository.findByInitiatedById(userId);
    }

    private void notifyWatchersAboutAudit(User initiator) {
        List<User> watchers = userRepository.findByRoleName("Смотритель");

        for (User watcher : watchers) {
            messageService.sendSystemMessage(
                    "Запущен системный аудит пользователем: " + initiator.getUsername() +
                            ". Возможны задержки в работе системы.",
                    watcher.getId()
            );
        }
    }
}
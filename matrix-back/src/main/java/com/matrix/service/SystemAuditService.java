package com.matrix.service;

import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.primary.SystemAudit;
import com.matrix.entity.primary.User;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.SystemAuditRepository;
import com.matrix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemAuditService {

    private final SystemAuditRepository systemAuditRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;

    @Transactional(readOnly = true)
    public List<SystemAudit> findAll() {
        return systemAuditRepository.findAll();
    }

    @Transactional(readOnly = true)
    public SystemAudit findById(Long id) {
        return systemAuditRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SystemAudit not found with id: " + id));
    }

    @Transactional
    public SystemAudit save(SystemAudit entity) {
        return systemAuditRepository.save(entity);
    }


    @Transactional(readOnly = true)
    public List<SystemAudit> getAuditsByInitiator(Long userId) {
        return systemAuditRepository.findByInitiatedById(userId);
    }

    private void notifyWatchersAboutAudit(User initiator) {
        List<User> watchers = userRepository.findByRole(RoleEnum.MONITOR);

        for (User watcher : watchers) {
            messageService.sendMessage(
                    initiator.getId(),
                    watcher.getId(),
                    "Запущен системный аудит пользователем: " + initiator.getUsername() +
                            ". Возможны задержки в работе системы."
            );
        }
    }
}
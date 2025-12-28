package com.matrix.service;

import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.SentinelTaskStatusEnum;
import com.matrix.entity.primary.SentinelTask;
import com.matrix.entity.primary.User;
import com.matrix.entity.auxiliary.RealLocation;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.SentinelTaskRepository;
import com.matrix.repository.UserRepository;
import com.matrix.repository.RealLocationRepository;
import com.matrix.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SentinelTaskService {

    private final SentinelTaskRepository sentinelTaskRepository;
    private final UserRepository userRepository;
    private final RealLocationRepository realLocationRepository;
    private final CustomUserDetailsService customUserDetailsService;

    @Transactional(readOnly = true)
    public List<SentinelTask> findAll() {
        return sentinelTaskRepository.findAll();
    }

    @Transactional(readOnly = true)
    public SentinelTask findById(Long id) {
        return sentinelTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SentinelTask not found with id: " + id));
    }

    @Transactional
    public SentinelTask save(SentinelTask entity) {
        return sentinelTaskRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return sentinelTaskRepository.existsById(id);
    }

    @Transactional
    public SentinelTask createTask(Long createdById, SentinelTaskStatusEnum status,
                                   Integer sentinelCount, Long locationId, String description) {

        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RealLocation location = realLocationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        SentinelTask task = new SentinelTask();
        task.setCreatedBy(createdBy);
        task.setStatus(status);
        task.setCreatedAt(LocalDateTime.now());
        task.setSentinelCount(sentinelCount);
        task.setLocation(location);
        task.setDescription(description);

        return sentinelTaskRepository.save(task);
    }

    @Transactional
    public SentinelTask updateTaskStatus(Long taskId, SentinelTaskStatusEnum status) {
        customUserDetailsService.checkRoles(List.of(RoleEnum.SENTINEL_CONTROLLER));

        SentinelTask task = findById(taskId);
        task.setStatus(status);
        return sentinelTaskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public List<SentinelTask> getTasksByStatus(SentinelTaskStatusEnum status) {
        return sentinelTaskRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<SentinelTask> getTasksByCreator(Long userId) {
        return sentinelTaskRepository.findByCreatedById(userId);
    }

    @Transactional(readOnly = true)
    public List<SentinelTask> getActiveSentinelTasks() {
        return sentinelTaskRepository.findByStatus(SentinelTaskStatusEnum.ACTIVE);
    }
}
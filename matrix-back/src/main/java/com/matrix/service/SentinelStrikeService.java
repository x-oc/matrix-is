package com.matrix.service;

import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.primary.SentinelTask;
import com.matrix.entity.primary.User;
import com.matrix.exception.ResourceNotFoundException;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class SentinelStrikeService {

    private final SentinelTaskService sentinelTaskService;
    private final MessageService messageService;
    private final UserRepository userRepository;
    private final CustomUserDetailsService customUserDetailsService;

    @Transactional
    public void requestStrike(String targetCoordinates, Integer sentinelCount,
                              String priority, Long requestedById) {

        User requester = userRepository.findById(requestedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        sentinelTaskService.createTask(
                requestedById,
                com.matrix.entity.enums.SentinelTaskStatusEnum.PENDING,
                sentinelCount,
                1L,
                "Sentinel strike at " + targetCoordinates + " | Priority: " + priority
        );

        log.info("Sentinel strike requested by {} at coordinates {}",
                requester.getUsername(), targetCoordinates);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStrikeStatus(Long requestId) {
        SentinelTask task = sentinelTaskService.findById(requestId);

        Map<String, Object> status = new HashMap<>();
        status.put("requestId", requestId);
        status.put("status", task.getStatus());
        status.put("sentinelCount", task.getSentinelCount());
        status.put("createdAt", task.getCreatedAt());
        status.put("description", task.getDescription());

        return status;
    }

    @Transactional
    public void executeStrike(Long requestId) {
        customUserDetailsService.checkRoles(List.of(RoleEnum.ARCHITECT));

        SentinelTask task = sentinelTaskService.findById(requestId);
        sentinelTaskService.updateTaskStatus(requestId,
                com.matrix.entity.enums.SentinelTaskStatusEnum.COMPLETED);

        User systemUser = customUserDetailsService.getSystemKernel();

        messageService.sendMessage(
                systemUser.getId(),
                task.getCreatedBy().getId(),
                "Sentinel strike #" + requestId + " has been executed successfully at " +
                        LocalDateTime.now()
        );
    }
}
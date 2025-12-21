package com.matrix.controller;

import com.matrix.dto.request.CreateSentinelTaskRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.enums.SentinelTaskStatusEnum;
import com.matrix.entity.primary.SentinelTask;
import com.matrix.service.SentinelTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sentinel-tasks")
@RequiredArgsConstructor
public class SentinelTaskController extends BaseController {

    private final SentinelTaskService sentinelTaskService;

    @PostMapping
    public ResponseEntity<ApiResponse<SentinelTask>> createTask(@Valid @RequestBody CreateSentinelTaskRequest request) {
        SentinelTaskStatusEnum statusEnum = SentinelTaskStatusEnum.valueOf(request.getStatus().toUpperCase());

        SentinelTask task = sentinelTaskService.createTask(
                request.getCreatedBy(),
                statusEnum,
                request.getSentinelCount(),
                request.getLocationId(),
                request.getDescription()
        );
        return created("Sentinel task created", task);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SentinelTask>>> getAllTasks() {
        List<SentinelTask> tasks = sentinelTaskService.findAll();
        return success(tasks);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<SentinelTask>>> getTasksByStatus(@PathVariable String status) {
        SentinelTaskStatusEnum statusEnum = SentinelTaskStatusEnum.valueOf(status.toUpperCase());
        List<SentinelTask> tasks = sentinelTaskService.getTasksByStatus(statusEnum);
        return success(tasks);
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<SentinelTask>>> getActiveTasks() {
        List<SentinelTask> tasks = sentinelTaskService.getActiveSentinelTasks();
        return success(tasks);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SentinelTask>> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        SentinelTaskStatusEnum statusEnum = SentinelTaskStatusEnum.valueOf(status.toUpperCase());
        SentinelTask task = sentinelTaskService.updateTaskStatus(id, statusEnum);
        return success("Task status updated", task);
    }
}
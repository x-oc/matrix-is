package com.matrix.controller;

import com.matrix.dto.mappers.CommonMapper;
import com.matrix.dto.request.CreateSentinelTaskRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.SentinelTaskResponse;
import com.matrix.entity.enums.SentinelTaskStatusEnum;
import com.matrix.entity.primary.SentinelTask;
import com.matrix.service.SentinelTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sentinel-tasks")
@RequiredArgsConstructor
public class SentinelTaskController extends BaseController {

    private final SentinelTaskService sentinelTaskService;

    @PostMapping
    public ResponseEntity<ApiResponse<SentinelTaskResponse>> createTask(@Valid @RequestBody CreateSentinelTaskRequest request) {
        SentinelTask task = sentinelTaskService.createTask(
                request.getCreatedBy(),
                request.getStatus(),
                request.getSentinelCount(),
                request.getLocationId(),
                request.getDescription()
        );
        return created("Sentinel task created", CommonMapper.map(task));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SentinelTaskResponse>>> getAllTasks() {
        List<SentinelTask> tasks = sentinelTaskService.findAll();
        return success(tasks.stream().map(CommonMapper::map).toList());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<SentinelTaskResponse>>> getTasksByStatus(@PathVariable SentinelTaskStatusEnum status) {
        List<SentinelTask> tasks = sentinelTaskService.getTasksByStatus(status);
        return success(tasks.stream().map(CommonMapper::map).toList());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SentinelTaskResponse>> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam SentinelTaskStatusEnum status) {
        SentinelTask task = sentinelTaskService.updateTaskStatus(id, status);
        return success("Task status updated", CommonMapper.map(task));
    }
}
package com.matrix.controller;

import com.matrix.dto.mappers.CommonMapper;
import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.SystemAuditResponse;
import com.matrix.entity.primary.SystemAudit;
import com.matrix.service.SystemAuditOrchestrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/system-audits")
@RequiredArgsConstructor
public class SystemAuditController extends BaseController {

    private final SystemAuditOrchestrationService auditService;

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<SystemAuditResponse>> initiateAudit() {
        SystemAudit audit = auditService.initiateFullSystemAudit();
        return created("System audit initiated", CommonMapper.map(audit));
    }

    @GetMapping("/{auditId}/point-of-no-return")
    public ResponseEntity<ApiResponse<String>> getPointOfNoReturnAnalysis(
            @PathVariable Long auditId) {
        String analysis = auditService.getPointOfNoReturnAnalysis(auditId);
        return ResponseEntity.ok(new ApiResponse<>(true, analysis, null, System.currentTimeMillis()));
    }

    @PostMapping("/{auditId}/recommend-chosen-one")
    public ResponseEntity<ApiResponse<Void>> recommendChosenOne(
            @PathVariable Long auditId) {
        auditService.recommendChosenOneBasedOnAudit(auditId);
        return success("Chosen one recommendations generated");
    }
}
package com.matrix.controller;

import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.primary.SystemAudit;
import com.matrix.service.SystemAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audits")
@RequiredArgsConstructor
public class SystemAuditController extends BaseController {

    private final SystemAuditService auditService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SystemAudit>>> getAllAudits() {
        List<SystemAudit> audits = auditService.findAll();
        return success(audits);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<SystemAudit>>> getAuditsByStatus(@PathVariable String status) {
        List<SystemAudit> audits = auditService.getAuditsByStatus(status);
        return success(audits);
    }

    @GetMapping("/initiator/{userId}")
    public ResponseEntity<ApiResponse<List<SystemAudit>>> getAuditsByInitiator(@PathVariable Long userId) {
        List<SystemAudit> audits = auditService.getAuditsByInitiator(userId);
        return success(audits);
    }

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<SystemAudit>> initiateAudit(
            @RequestParam Long auditTypeId,
            @RequestParam Integer stabilityScore,
            @RequestParam Boolean pointOfNoReturn,
            @RequestParam Long initiatedById,
            @RequestParam String auditData,
            @RequestParam String status) {

        SystemAudit audit = auditService.initiateAudit(
                auditTypeId, stabilityScore, pointOfNoReturn,
                initiatedById, auditData, status
        );
        return created("Audit initiated", audit);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateAuditStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) Integer stabilityScore) {

        auditService.updateAuditStatus(id, status, stabilityScore);
        return success("Audit status updated");
    }
}

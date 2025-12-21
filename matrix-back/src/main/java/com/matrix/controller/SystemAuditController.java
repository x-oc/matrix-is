package com.matrix.controller;

import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.enums.AuditStatusEnum;
import com.matrix.entity.enums.AuditTypeEnum;
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
        AuditStatusEnum statusEnum = AuditStatusEnum.valueOf(status.toUpperCase());  // Преобразуем строку в ENUM
        List<SystemAudit> audits = auditService.getAuditsByStatus(statusEnum);
        return success(audits);
    }

    @GetMapping("/initiator/{userId}")
    public ResponseEntity<ApiResponse<List<SystemAudit>>> getAuditsByInitiator(@PathVariable Long userId) {
        List<SystemAudit> audits = auditService.getAuditsByInitiator(userId);
        return success(audits);
    }

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<SystemAudit>> initiateAudit(
            @RequestParam String auditType,
            @RequestParam Integer stabilityScore,
            @RequestParam Boolean pointOfNoReturn,
            @RequestParam Long initiatedById,
            @RequestParam String auditData,
            @RequestParam String status) {

        AuditTypeEnum auditTypeEnum = AuditTypeEnum.valueOf(auditType.toUpperCase());
        AuditStatusEnum statusEnum = AuditStatusEnum.valueOf(status.toUpperCase());

        SystemAudit audit = auditService.initiateAudit(
                auditTypeEnum, stabilityScore, pointOfNoReturn,
                initiatedById, auditData, statusEnum
        );
        return created("Audit initiated", audit);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateAuditStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) Integer stabilityScore) {

        AuditStatusEnum statusEnum = AuditStatusEnum.valueOf(status.toUpperCase());

        auditService.updateAuditStatus(id, statusEnum, stabilityScore);
        return success("Audit status updated");
    }
}
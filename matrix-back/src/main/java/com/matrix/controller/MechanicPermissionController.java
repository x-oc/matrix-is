package com.matrix.controller;

import com.matrix.dto.request.CreateMechanicPermissionRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.linking.MechanicPermission;
import com.matrix.service.MechanicPermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mechanic-permissions")
@RequiredArgsConstructor
public class MechanicPermissionController extends BaseController {

    private final MechanicPermissionService permissionService;

    @PostMapping
    public ResponseEntity<ApiResponse<MechanicPermission>> createPermission(
            @Valid @RequestBody CreateMechanicPermissionRequest request) {
        MechanicPermission permission = permissionService.createPermission(
                request.getUserId(),
                request.getSectorId(),
                request.getPermissionStart(),
                request.getPermissionEnd()
        );
        return created("Permission created", permission);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<MechanicPermission>>> getByUser(@PathVariable Long userId) {
        List<MechanicPermission> permissions = permissionService.getByUser(userId);
        return success(permissions);
    }

    @GetMapping("/sector/{sectorId}")
    public ResponseEntity<ApiResponse<List<MechanicPermission>>> getBySector(@PathVariable Long sectorId) {
        List<MechanicPermission> permissions = permissionService.getBySector(sectorId);
        return success(permissions);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> revokePermission(@PathVariable Long id) {
        permissionService.revokePermission(id);
        return success("Permission revoked");
    }
}
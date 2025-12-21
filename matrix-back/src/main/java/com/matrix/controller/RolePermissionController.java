package com.matrix.controller;

import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.enums.PermissionEnum;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.linking.RolePermission;
import com.matrix.service.RolePermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role-permissions")
@RequiredArgsConstructor
public class RolePermissionController extends BaseController {

    private final RolePermissionService rolePermissionService;

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<PermissionEnum>>> getPermissionsByRole(
            @PathVariable RoleEnum role) {
        List<PermissionEnum> permissions = rolePermissionService.getPermissionList(role);
        return success(permissions);
    }

    @PostMapping("/grant")
    public ResponseEntity<ApiResponse<RolePermission>> grantPermission(
            @RequestParam RoleEnum role,
            @RequestParam PermissionEnum permission) {
        RolePermission rolePermission = rolePermissionService.grantPermission(role, permission);
        return created("Permission granted", rolePermission);
    }

    @DeleteMapping("/revoke")
    public ResponseEntity<ApiResponse<Void>> revokePermission(
            @RequestParam RoleEnum role,
            @RequestParam PermissionEnum permission) {
        rolePermissionService.revokePermission(role, permission);
        return success("Permission revoked");
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkPermission(
            @RequestParam RoleEnum role,
            @RequestParam PermissionEnum permission) {
        boolean hasPermission = rolePermissionService.hasPermission(role, permission);
        return success(hasPermission);
    }
}
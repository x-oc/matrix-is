package com.matrix.service;

import com.matrix.entity.enums.PermissionEnum;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.linking.RolePermission;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RolePermissionService extends BaseService<RolePermission, Long> {

    private final RolePermissionRepository rolePermissionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RolePermission> findAll() {
        return rolePermissionRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public RolePermission findById(Long id) {
        return rolePermissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RolePermission not found with id: " + id));
    }

    @Override
    @Transactional
    public RolePermission save(RolePermission entity) {
        return rolePermissionRepository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!rolePermissionRepository.existsById(id)) {
            throw new ResourceNotFoundException("RolePermission not found with id: " + id);
        }
        rolePermissionRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return rolePermissionRepository.existsById(id);
    }

    @Transactional
    public RolePermission grantPermission(RoleEnum role, PermissionEnum permission) {
        if (rolePermissionRepository.existsByRoleAndPermission(role, permission)) {
            throw new BusinessException("Permission already granted");
        }

        RolePermission rolePermission = new RolePermission();
        rolePermission.setRole(role);
        rolePermission.setPermission(permission);

        return rolePermissionRepository.save(rolePermission);
    }

    @Transactional
    public void revokePermission(RoleEnum role, PermissionEnum permission) {
        if (!rolePermissionRepository.existsByRoleAndPermission(role, permission)) {
            throw new ResourceNotFoundException("Permission not found");
        }
        rolePermissionRepository.deleteByRoleAndPermission(role, permission);
    }

    @Transactional(readOnly = true)
    public List<RolePermission> getPermissionsByRole(RoleEnum role) {
        return rolePermissionRepository.findByRole(role);
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(RoleEnum role, PermissionEnum permission) {
        return rolePermissionRepository.existsByRoleAndPermission(role, permission);
    }

    @Transactional(readOnly = true)
    public List<PermissionEnum> getPermissionList(RoleEnum role) {
        return getPermissionsByRole(role).stream()
                .map(RolePermission::getPermission)
                .toList();
    }
}
package com.matrix.repository;

import com.matrix.entity.enums.PermissionEnum;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.linking.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findByRole(RoleEnum role);
    boolean existsByRoleAndPermission(RoleEnum role, PermissionEnum permission);
    void deleteByRoleAndPermission(RoleEnum role, PermissionEnum permission);
}
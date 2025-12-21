package com.matrix.entity.linking;

import com.matrix.entity.enums.PermissionEnum;
import com.matrix.entity.enums.RoleEnum;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
class RolePermissionId implements java.io.Serializable {
    private RoleEnum role;
    private PermissionEnum permission;
}
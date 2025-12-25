package com.matrix.entity.linking;

import com.matrix.entity.enums.PermissionEnum;
import com.matrix.entity.enums.RoleEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "role_permissions")
@IdClass(RolePermissionId.class)
@Getter
@Setter
public class RolePermission {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private RoleEnum role;

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "permission", nullable = false)
    private PermissionEnum permission;
}

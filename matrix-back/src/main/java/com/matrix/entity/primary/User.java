package com.matrix.entity.primary;

import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.linking.MechanicPermission;
import com.matrix.entity.linking.UserTicket;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, columnDefinition = "role_enum")
    private RoleEnum role;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MechanicPermission> mechanicPermissions = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserTicket> assignedTickets = new HashSet<>();

    @OneToMany(mappedBy = "selectedBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChosenOne> selectedChosenOnes = new HashSet<>();
}
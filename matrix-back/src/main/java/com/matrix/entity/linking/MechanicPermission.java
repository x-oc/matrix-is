package com.matrix.entity.linking;

import com.matrix.entity.auxiliary.Sector;
import com.matrix.entity.primary.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "mechanic_permissions")
@Getter
@Setter
public class MechanicPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sector_id", nullable = false)
    private Sector sector;

    @Column(name = "permission_start", nullable = false)
    private LocalDateTime permissionStart;

    @Column(name = "permission_end", nullable = false)
    private LocalDateTime permissionEnd;
}
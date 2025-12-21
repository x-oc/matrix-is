package com.matrix.repository;

import com.matrix.entity.linking.MechanicPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MechanicPermissionRepository extends JpaRepository<MechanicPermission, Long> {
    List<MechanicPermission> findByUserId(Long userId);
    List<MechanicPermission> findBySectorId(Long sectorId);

    @Query("SELECT mp FROM MechanicPermission mp WHERE mp.user.id = :userId AND mp.permissionStart <= :now AND mp.permissionEnd >= :now")
    List<MechanicPermission> findActivePermissionsByUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
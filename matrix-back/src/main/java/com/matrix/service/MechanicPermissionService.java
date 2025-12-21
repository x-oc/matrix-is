package com.matrix.service;

import com.matrix.entity.auxiliary.Sector;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.linking.MechanicPermission;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.MechanicPermissionRepository;
import com.matrix.repository.SectorRepository;
import com.matrix.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class MechanicPermissionService extends BaseService<MechanicPermission, Long> {

    private final MechanicPermissionRepository mechanicPermissionRepository;
    private final UserRepository userRepository;
    private final SectorRepository sectorRepository;

    public MechanicPermissionService(MechanicPermissionRepository mechanicPermissionRepository,
                                     UserRepository userRepository,
                                     SectorRepository sectorRepository) {
        super(mechanicPermissionRepository);
        this.mechanicPermissionRepository = mechanicPermissionRepository;
        this.userRepository = userRepository;
        this.sectorRepository = sectorRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MechanicPermission> findAll() {
        return mechanicPermissionRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public MechanicPermission findById(Long id) {
        return mechanicPermissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MechanicPermission not found with id: " + id));
    }

    @Override
    @Transactional
    public MechanicPermission save(MechanicPermission entity) {
        return mechanicPermissionRepository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!mechanicPermissionRepository.existsById(id)) {
            throw new ResourceNotFoundException("MechanicPermission not found with id: " + id);
        }
        mechanicPermissionRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return mechanicPermissionRepository.existsById(id);
    }

    @Transactional
    public MechanicPermission createPermission(Long userId, Long sectorId,
                                               LocalDateTime start, LocalDateTime end) {

        if (end.isBefore(start)) {
            throw new BusinessException("Permission end date must be after start date");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != RoleEnum.MECHANIC) {
            throw new BusinessException("Only mechanics can have sector permissions");
        }

        Sector sector = sectorRepository.findById(sectorId)
                .orElseThrow(() -> new ResourceNotFoundException("Sector not found"));

        MechanicPermission permission = new MechanicPermission();
        permission.setUser(user);
        permission.setSector(sector);
        permission.setPermissionStart(start);
        permission.setPermissionEnd(end);

        return mechanicPermissionRepository.save(permission);
    }

    @Transactional(readOnly = true)
    public List<MechanicPermission> getByUser(Long userId) {
        return mechanicPermissionRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<MechanicPermission> getBySector(Long sectorId) {
        return mechanicPermissionRepository.findBySectorId(sectorId);
    }

    @Transactional(readOnly = true)
    public List<MechanicPermission> getActivePermissions(Long userId) {
        return mechanicPermissionRepository.findActivePermissionsByUser(userId, LocalDateTime.now());
    }

    @Transactional
    public void revokePermission(Long permissionId) {
        if (!mechanicPermissionRepository.existsById(permissionId)) {
            throw new ResourceNotFoundException("Permission not found");
        }
        mechanicPermissionRepository.deleteById(permissionId);
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(Long userId, Long sectorId) {
        return mechanicPermissionRepository.findActivePermissionsByUser(userId, LocalDateTime.now())
                .stream()
                .anyMatch(permission -> permission.getSector().getId().equals(sectorId));
    }
}
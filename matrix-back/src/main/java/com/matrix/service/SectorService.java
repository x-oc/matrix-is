package com.matrix.service;

import com.matrix.dto.request.AdministerSectorRequest;
import com.matrix.entity.auxiliary.Sector;
import com.matrix.entity.linking.MechanicPermission;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.SectorRepository;
import com.matrix.security.CustomUserDetailsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class SectorService extends BaseService<Sector, Long> {

    private final SectorRepository sectorRepository;
    private final MechanicPermissionService mechanicPermissionService;
    private final CustomUserDetailsService customUserDetailsService;

    public SectorService(SectorRepository sectorRepository,
                         MechanicPermissionService mechanicPermissionService,
                         CustomUserDetailsService customUserDetailsService) {
        super(sectorRepository);
        this.sectorRepository = sectorRepository;
        this.mechanicPermissionService = mechanicPermissionService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Sector> findAll() {
        return sectorRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Sector findById(Long id) {
        return sectorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sector not found with id: " + id));
    }

    @Transactional
    public Sector save(AdministerSectorRequest request) {
        Sector sector = findById(request.getSectorId());
        User user = customUserDetailsService.getUser();
        LocalDateTime now = LocalDateTime.now();
        List<MechanicPermission> permissions = mechanicPermissionService.getByUser(user.getId()).stream()
                .filter(permission -> permission.getUser() == user &&
                        permission.getPermissionEnd().isAfter(now) &&
                        permission.getPermissionStart().isBefore(now)).toList();
        if (permissions.isEmpty()) {
            throw new BusinessException("You don't have permission to edit sector");
        }
        sector.setCode(request.getPatchCode());
        return sectorRepository.save(sector);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!sectorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Sector not found with id: " + id);
        }
        sectorRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return sectorRepository.existsById(id);
    }

    @Transactional(readOnly = true)
    public Sector findByCode(String code) {
        return sectorRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Sector not found with code: " + code));
    }

    @Transactional
    public Sector createSector(String code) {
        if (sectorRepository.findByCode(code).isPresent()) {
            throw new BusinessException("Sector with code " + code + " already exists");
        }

        Sector sector = new Sector();
        sector.setCode(code);
        return sectorRepository.save(sector);
    }
}
package com.matrix.service;

import com.matrix.entity.auxiliary.Sector;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.SectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SectorService extends BaseService<Sector, Long> {

    private final SectorRepository sectorRepository;

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

    @Override
    @Transactional
    public Sector save(Sector entity) {
        return sectorRepository.save(entity);
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
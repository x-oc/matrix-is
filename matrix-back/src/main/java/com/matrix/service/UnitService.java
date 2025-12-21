package com.matrix.service;

import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.entity.auxiliary.RealLocation;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.UnitStatusEnum;
import com.matrix.entity.primary.ChosenOne;
import com.matrix.entity.primary.Unit;
import com.matrix.entity.primary.User;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class UnitService extends BaseService<Unit, Long> {

    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final MatrixIterationRepository matrixIterationRepository;
    private final ChosenOneRepository chosenOneRepository;
    private final RealLocationRepository realLocationRepository;

    public UnitService(UnitRepository unitRepository,
                       UserRepository userRepository,
                       MatrixIterationRepository matrixIterationRepository,
                       ChosenOneRepository chosenOneRepository,
                       RealLocationRepository realLocationRepository) {
        super(unitRepository);
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.matrixIterationRepository = matrixIterationRepository;
        this.chosenOneRepository = chosenOneRepository;
        this.realLocationRepository = realLocationRepository;
    }

    @Transactional(readOnly = true)
    public List<Unit> findCandidates() {
        return unitRepository.findByStatus(UnitStatusEnum.CANDIDATE);
    }

    @Transactional
    public ChosenOne selectChosenOne(Long unitId, Long selectedByUserId, Long matrixIterationId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found"));

        User selectedBy = userRepository.findById(selectedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MatrixIteration iteration = matrixIterationRepository.findById(matrixIterationId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrix iteration not found"));

        User chosenUser = new User();
        chosenUser.setUsername("chosen_" + unitId);
        chosenUser.setPassword("temp_pass_" + unitId);
        chosenUser.setRole(RoleEnum.THE_ONE);
        chosenUser.setCreatedAt(LocalDateTime.now());
        chosenUser.setIsActive(true);
        userRepository.save(chosenUser);

        unit.setStatus(UnitStatusEnum.THE_ONE);
        unit.setStatusUpdateAt(LocalDateTime.now());
        unitRepository.save(unit);

        ChosenOne chosenOne = new ChosenOne();
        chosenOne.setUnit(unit);
        chosenOne.setSelectedBy(selectedBy);
        chosenOne.setUser(chosenUser);
        chosenOne.setMatrixIteration(iteration);
        chosenOne.setSelectedAt(LocalDateTime.now());
        chosenOne.setRestrictionsLifted(true);

        return chosenOneRepository.save(chosenOne);
    }

    @Transactional(readOnly = true)
    public List<Unit> getUnitsWithHighDisagreement() {
        return unitRepository.findByDisagreementIndexGreaterThan(8.5);
    }

    @Transactional
    public Unit createUnit(Double disagreementIndex, String dossier, Long locationId) {
        RealLocation location = null;
        if (locationId != null) {
            location = realLocationRepository.findById(locationId)
                    .orElse(null);
        }

        Unit unit = new Unit();
        unit.setDisagreementIndex(disagreementIndex);
        unit.setStatus(UnitStatusEnum.NORMAL);
        unit.setDossier(dossier);
        unit.setStatusUpdateAt(LocalDateTime.now());
        unit.setRealLocation(location);

        return unitRepository.save(unit);
    }
}
package com.matrix.service;

import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.entity.auxiliary.RealLocation;
import com.matrix.entity.enums.OracleRequestStatusEnum;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.UnitStatusEnum;
import com.matrix.entity.primary.ChosenOne;
import com.matrix.entity.primary.OracleRequest;
import com.matrix.entity.primary.Unit;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UnitService {

    @Value("${matrix.system.candidate-disagreement-threshold:8.5}")
    private Double candidateThreshold;

    private final UnitRepository unitRepository;
    private final OracleRequestRepository oracleRequestRepository;
    private final MatrixIterationRepository matrixIterationRepository;
    private final UserRepository userRepository;
    private final ChosenOneRepository chosenOneRepository;
    private final RealLocationRepository realLocationRepository;
    private final MessageService messageService;

    @Transactional(readOnly = true)
    public List<Unit> findAll() {
        return unitRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Unit findById(Long id) {
        return unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Unit> findCandidates() {
        return unitRepository.findCandidates(candidateThreshold,
                List.of(UnitStatusEnum.CANDIDATE, UnitStatusEnum.AWAKENED));
    }

    @Transactional
    public void createCandidateRequest(Unit unit) {
        if (unit.getDisagreementIndex() > candidateThreshold) {
            log.info("Creating oracle request for candidate unit: {}", unit.getId());

            MatrixIteration currentIteration = matrixIterationRepository.findTopByOrderByIdDesc()
                    .orElseGet(() -> {
                        MatrixIteration newIteration = new MatrixIteration();
                        newIteration.setNum(1);
                        newIteration.setDescription("Автоматически созданная итерация");
                        return matrixIterationRepository.save(newIteration);
                    });

            User systemUser = userRepository.findByUsername("system")
                    .orElseGet(() -> {
                        User newSystemUser = new User();
                        newSystemUser.setUsername("system");
                        newSystemUser.setPassword("default_password");
                        newSystemUser.setRole(RoleEnum.SYSTEM_KERNEL);
                        newSystemUser.setCreatedAt(LocalDateTime.now());
                        newSystemUser.setIsActive(true);
                        return userRepository.save(newSystemUser);
                    });

            OracleRequest request = new OracleRequest();
            request.setMatrixIteration(currentIteration);
            request.setUnit(unit);
            request.setStatus(OracleRequestStatusEnum.PENDING);
            request.setRequestedBy(systemUser);
            request.setCreatedAt(LocalDateTime.now());

            oracleRequestRepository.save(request);
        }
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
        return unitRepository.findByDisagreementIndexGreaterThan(candidateThreshold);
    }

    @Transactional
    public Unit createUnitCandidate(Double disagreementIndex, String dossier, Long locationId) {
        if (disagreementIndex > 8.5) {
            Unit unit = new Unit();
            unit.setDisagreementIndex(disagreementIndex);
            unit.setStatus(UnitStatusEnum.CANDIDATE);
            unit.setDossier(dossier);
            unit.setStatusUpdateAt(LocalDateTime.now());

            if (locationId != null) {
                RealLocation location = realLocationRepository.findById(locationId)
                        .orElse(null);
                unit.setRealLocation(location);
            }

            Unit saved = unitRepository.save(unit);

            createOracleRequestForCandidate(saved.getId());
            notifyAgentsAboutCandidate(saved);

            return saved;
        }
        return null;
    }

    private void createOracleRequestForCandidate(Long unitId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found"));

        MatrixIteration currentIteration = matrixIterationRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new BusinessException("No matrix iteration found"));

        User system = userRepository.findByUsername("system")
                .orElseThrow(() -> new BusinessException("System user not found"));

        OracleRequest request = new OracleRequest();
        request.setMatrixIteration(currentIteration);
        request.setUnit(unit);
        request.setStatus(OracleRequestStatusEnum.PENDING);
        request.setRequestedBy(system);
        request.setCreatedAt(LocalDateTime.now());

        oracleRequestRepository.save(request);
    }

    private void notifyAgentsAboutCandidate(Unit unit) {
        User systemUser = userRepository.findByUsername("system")
                .orElseThrow(() -> new BusinessException("System user not found"));

        List<User> agents = userRepository.findByRole(RoleEnum.AGENT_SMITH);
        for (User agent : agents) {
            if (agent.getIsActive()) {
                try {
                    messageService.sendMessage(
                            systemUser.getId(),
                            agent.getId(),
                            "Обнаружен кандидат! ID: " + unit.getId() +
                                    ", Индекс несогласия: " + unit.getDisagreementIndex() +
                                    ", Досье: " + unit.getDossier()
                    );
                } catch (Exception e) {
                    log.error("Failed to send message to agent {}", agent.getId(), e);
                }
            }
        }

        List<User> monitors = userRepository.findByRole(RoleEnum.MONITOR);
        for (User monitor : monitors) {
            if (monitor.getIsActive()) {
                try {
                    messageService.sendMessage(
                            systemUser.getId(),
                            monitor.getId(),
                            "Кандидат обнаружен: " + unit.getId()
                    );
                } catch (Exception e) {
                    log.error("Failed to send message to monitor {}", monitor.getId(), e);
                }
            }
        }
    }
}
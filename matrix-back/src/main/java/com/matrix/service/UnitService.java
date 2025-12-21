package com.matrix.service;

import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.entity.auxiliary.Role;
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
    private final RoleRepository roleRepository;
    private final ChosenOneRepository chosenOneRepository;

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
                List.of("кандидат", "проснувшийся"));
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
                        // Create system user if not exists
                        Role systemRole = roleRepository.findByName("Системное Ядро")
                                .orElseThrow(() -> new BusinessException("System role not found"));

                        User newSystemUser = new User();
                        newSystemUser.setUsername("system");
                        newSystemUser.setPassword("default_password");
                        newSystemUser.setRole(systemRole);
                        newSystemUser.setCreatedAt(LocalDateTime.now());
                        newSystemUser.setIsActive(true);
                        return userRepository.save(newSystemUser);
                    });

            OracleRequest request = new OracleRequest();
            request.setMatrixIteration(currentIteration);
            request.setUnit(unit);
            request.setStatus("pending");
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

        Role chosenRole = roleRepository.findByName("Избранный")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("Избранный");
                    return roleRepository.save(newRole);
                });

        // Create user for chosen one
        User chosenUser = new User();
        chosenUser.setUsername("chosen_" + unitId);
        chosenUser.setPassword("temp_pass_" + unitId);
        chosenUser.setRole(chosenRole);
        chosenUser.setCreatedAt(LocalDateTime.now());
        chosenUser.setIsActive(true);
        userRepository.save(chosenUser);

        // Update unit status
        unit.setStatus("Избранный");
        unit.setStatusUpdateAt(LocalDateTime.now());
        unitRepository.save(unit);

        // Create chosen one record
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
}
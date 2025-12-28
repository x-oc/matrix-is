package com.matrix.service;

import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.primary.ChosenOne;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.ChosenOneRepository;
import com.matrix.repository.MatrixIterationRepository;
import com.matrix.repository.UnitRepository;
import com.matrix.repository.UserRepository;
import com.matrix.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChosenOneService {

    private final ChosenOneRepository chosenOneRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final MatrixIterationRepository matrixIterationRepository;
    private final DatabaseProcedureService databaseProcedureService;
    private final CustomUserDetailsService customUserDetailsService;

    @Transactional
    public void selectChosenOne(Long unitId, Long selectedById, Long matrixIterationId) {
        customUserDetailsService.checkRoles(List.of(RoleEnum.ARCHITECT));

        unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found"));
        userRepository.findById(selectedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        matrixIterationRepository.findById(matrixIterationId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrix iteration not found"));

        databaseProcedureService.selectChosenOne(unitId, selectedById, matrixIterationId);
    }

    @Transactional
    public ChosenOne liftRestrictions(Long chosenOneId) {
        customUserDetailsService.checkRoles(List.of(RoleEnum.ARCHITECT));

        ChosenOne chosenOne = chosenOneRepository.findById(chosenOneId)
                .orElseThrow(() -> new ResourceNotFoundException("Chosen one not found"));

        chosenOne.setRestrictionsLifted(true);
        return chosenOneRepository.save(chosenOne);
    }

    @Transactional
    public String conductFinalInterview(Long chosenOneId, String decision) {
        customUserDetailsService.checkRoles(List.of(RoleEnum.ARCHITECT));

        ChosenOne chosenOne = chosenOneRepository.findById(chosenOneId)
                .orElseThrow(() -> new ResourceNotFoundException("Chosen one not found"));

        chosenOne.setFinalDecision(decision);
        chosenOneRepository.save(chosenOne);
        return decision;
    }

    @Transactional(readOnly = true)
    public ChosenOne getCurrentChosenOne() {
        customUserDetailsService.checkRoles(List.of(RoleEnum.ARCHITECT));

        MatrixIteration currentIteration = matrixIterationRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new ResourceNotFoundException("No matrix iteration found"));

        return chosenOneRepository.findByMatrixIterationId(currentIteration.getId())
                .stream()
                .filter(chosenOne -> chosenOne.getRestrictionsLifted() != null && chosenOne.getRestrictionsLifted())
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No active chosen one found"));
    }
}
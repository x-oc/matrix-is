package com.matrix.service;

import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.enums.UnitStatusEnum;
import com.matrix.entity.primary.ChosenOne;
import com.matrix.entity.primary.Unit;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.ChosenOneRepository;
import com.matrix.repository.MatrixIterationRepository;
import com.matrix.repository.UnitRepository;
import com.matrix.repository.UserRepository;
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

    @Transactional
    public ChosenOne selectChosenOne(Long unitId, Long selectedById, Long matrixIterationId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found"));

        User selectedBy = userRepository.findById(selectedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MatrixIteration iteration = matrixIterationRepository.findById(matrixIterationId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrix iteration not found"));

        User chosenUser = new User();
        chosenUser.setUsername("chosen_" + unitId);
        chosenUser.setPassword("matrix_" + System.currentTimeMillis());
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

        return chosenOneRepository.save(chosenOne);
    }

    @Transactional
    public ChosenOne liftRestrictions(Long chosenOneId) {
        ChosenOne chosenOne = chosenOneRepository.findById(chosenOneId)
                .orElseThrow(() -> new ResourceNotFoundException("Chosen one not found"));

        chosenOne.setRestrictionsLifted(true);
        return chosenOneRepository.save(chosenOne);
    }

    @Transactional
    public String conductFinalInterview(Long chosenOneId, String decision) {
        ChosenOne chosenOne = chosenOneRepository.findById(chosenOneId)
                .orElseThrow(() -> new ResourceNotFoundException("Chosen one not found"));

        chosenOne.setFinalDecision(decision);

        if ("MATRIX_REBOOT".equals(decision)) {
            chosenOneRepository.save(chosenOne);
            return "Matrix reboot initiated. All sentinels notified.";
        } else if ("ZION_DESTRUCTION".equals(decision)) {
            chosenOneRepository.save(chosenOne);
            return "Zion destruction protocol activated.";
        } else {
            throw new BusinessException("Invalid decision");
        }
    }

    @Transactional(readOnly = true)
    public ChosenOne getCurrentChosenOne() {
        MatrixIteration currentIteration = matrixIterationRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new ResourceNotFoundException("No matrix iteration found"));

        return chosenOneRepository.findByMatrixIterationId(currentIteration.getId())
                .stream()
                .filter(chosenOne -> chosenOne.getRestrictionsLifted() != null && chosenOne.getRestrictionsLifted())
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No active chosen one found"));
    }

    @Transactional(readOnly = true)
    public List<ChosenOne> getByIteration(Long iterationId) {
        return chosenOneRepository.findByMatrixIterationId(iterationId);
    }
}
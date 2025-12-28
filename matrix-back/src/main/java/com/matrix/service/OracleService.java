package com.matrix.service;

import com.matrix.dto.request.OraclePredictionRequest;
import com.matrix.dto.request.OracleProcessPredictionRequest;
import com.matrix.dto.response.OraclePredictionResponse;
import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.entity.enums.OracleRequestStatusEnum;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.primary.Forecast;
import com.matrix.entity.primary.OracleRequest;
import com.matrix.entity.primary.Unit;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.ForecastRepository;
import com.matrix.repository.MatrixIterationRepository;
import com.matrix.repository.OracleRequestRepository;
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
public class OracleService {

    private final OracleRequestRepository oracleRequestRepository;
    private final ForecastRepository forecastRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final MatrixIterationRepository matrixIterationRepository;
    private final MessageService messageService;
    private final CustomUserDetailsService customUserDetailsService;
    private final DatabaseProcedureService databaseProcedureService;

    @Transactional
    public OracleRequest requestPrediction(OraclePredictionRequest request) {
        customUserDetailsService.checkRoles(List.of(RoleEnum.AGENT_SMITH));

        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found"));

        User requester = userRepository.findById(request.getRequestedBy())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MatrixIteration currentIteration = matrixIterationRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new BusinessException("No matrix iteration found"));

        OracleRequest oracleRequest = new OracleRequest();
        oracleRequest.setMatrixIteration(currentIteration);
        oracleRequest.setUnit(unit);
        oracleRequest.setStatus(OracleRequestStatusEnum.PENDING);
        oracleRequest.setRequestedBy(requester);
        oracleRequest.setCreatedAt(LocalDateTime.now());

        return oracleRequestRepository.save(oracleRequest);
    }

    @Transactional
    public void processPredictionAndGetResponse(OracleProcessPredictionRequest request) {
        customUserDetailsService.checkRoles(List.of(RoleEnum.ORACLE));
        User oracleUser = customUserDetailsService.getUser();

        oracleRequestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Oracle request not found"));

        databaseProcedureService.processOraclePrediction(request.getRequestId(), oracleUser.getId(), request.getRecommendedAction());
    }

    @Transactional(readOnly = true)
    public List<OracleRequest> getPendingRequests() {
        customUserDetailsService.checkRoles(List.of(RoleEnum.ORACLE, RoleEnum.AGENT_SMITH));
        return oracleRequestRepository.findByStatus(OracleRequestStatusEnum.PENDING);
    }

    @Transactional(readOnly = true)
    public List<Forecast> getForecastsByUnit(Long unitId) {
        return forecastRepository.findByOracleRequestUnitId(unitId);
    }

    @Transactional(readOnly = true)
    public OraclePredictionResponse getLatestPredictionForUnit(Long unitId) {
        List<Forecast> forecasts = forecastRepository.findByOracleRequestUnitId(unitId);
        if (forecasts.isEmpty()) {
            return null;
        }

        Forecast latest = forecasts.get(forecasts.size() - 1);

        OraclePredictionResponse response = new OraclePredictionResponse();
        response.setRequestId(latest.getOracleRequest().getId());
        response.setUnitId(unitId);
        response.setPrediction(latest.getForecast());
        response.setCreatedAt(latest.getCreatedAt());

        return response;
    }
}
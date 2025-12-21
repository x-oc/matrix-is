package com.matrix.service;

import com.matrix.dto.request.RequestOraclePredictionRequest;
import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.entity.primary.*;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.*;
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
    private final MessageRepository messageRepository;

    @Transactional
    public OracleRequest requestPrediction(RequestOraclePredictionRequest request) {
        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found"));

        User requester = userRepository.findById(request.getRequestedBy())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MatrixIteration currentIteration = matrixIterationRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new BusinessException("No matrix iteration found"));

        OracleRequest oracleRequest = new OracleRequest();
        oracleRequest.setMatrixIteration(currentIteration);
        oracleRequest.setUnit(unit);
        oracleRequest.setStatus("pending");
        oracleRequest.setRequestedBy(requester);
        oracleRequest.setCreatedAt(LocalDateTime.now());

        return oracleRequestRepository.save(oracleRequest);
    }

    @Transactional
    public Forecast processPrediction(Long requestId, String forecastText) {
        OracleRequest request = oracleRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Oracle request not found"));

        User oracleUser = userRepository.findByUsername("oracle_main")
                .orElseGet(() -> userRepository.findByUsername("system")
                        .orElseThrow(() -> new BusinessException("Oracle user not found")));

        // Create forecast
        Forecast forecast = new Forecast();
        forecast.setOracleRequest(request);
        forecast.setForecast(forecastText);
        forecast.setCreatedAt(LocalDateTime.now());
        forecastRepository.save(forecast);

        // Update request status
        request.setStatus("completed");
        request.setProcessedAt(LocalDateTime.now());
        oracleRequestRepository.save(request);

        // Send notification
        Message message = new Message();
        message.setFromUser(oracleUser);
        message.setToUser(request.getRequestedBy());
        message.setText("Прогноз для запроса #" + requestId + " готов");
        message.setSentAt(LocalDateTime.now());
        messageRepository.save(message);

        return forecast;
    }

    @Transactional(readOnly = true)
    public List<OracleRequest> getPendingRequests() {
        return oracleRequestRepository.findByStatus("pending");
    }

    @Transactional(readOnly = true)
    public List<Forecast> getForecastsByUnit(Long unitId) {
        return forecastRepository.findByOracleRequestUnitId(unitId);
    }
}
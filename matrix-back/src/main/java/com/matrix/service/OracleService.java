package com.matrix.service;

import com.matrix.dto.request.OraclePredictionRequest;
import com.matrix.dto.request.OracleProcessPredictionRequest;
import com.matrix.dto.response.OraclePredictionResponse;
import com.matrix.entity.auxiliary.MatrixIteration;
import com.matrix.entity.enums.OracleRequestStatusEnum;
import com.matrix.entity.enums.UnitStatusEnum;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

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

    @Transactional
    public OracleRequest requestPrediction(OraclePredictionRequest request) {
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
        OracleRequest oracleRequest = oracleRequestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Oracle request not found"));

        User oracleUser = userRepository.findByUsername("oracle_main")
                .orElseGet(() -> userRepository.findByUsername("system")
                        .orElseThrow(() -> new BusinessException("Oracle user not found")));


        Forecast forecast = new Forecast();
        forecast.setOracleRequest(oracleRequest);
        forecast.setForecast(request.getRecommendedAction());
        forecast.setCreatedAt(LocalDateTime.now());
        forecastRepository.save(forecast);

        oracleRequest.setStatus(OracleRequestStatusEnum.COMPLETED);
        oracleRequest.setProcessedAt(LocalDateTime.now());
        oracleRequestRepository.save(oracleRequest);

        messageService.sendMessage(
                oracleUser.getId(),
                oracleRequest.getRequestedBy().getId(),
                "Прогноз для запроса #" + oracleRequest.getId() + " готов. Рекомендуемое действие: " +
                        request.getRecommendedAction()
        );
    }

    private OraclePredictionResponse generatePrediction(OracleRequest request) {
        OraclePredictionResponse response = new OraclePredictionResponse();
        response.setRequestId(request.getId());
        response.setUnitId(request.getUnit().getId());
        response.setUnitName(request.getUnit().getDossier());
        response.setCreatedAt(LocalDateTime.now());

        Unit unit = request.getUnit();
        double disagreement = unit.getDisagreementIndex();

        Map<String, Double> probabilities = new HashMap<>();

        if (unit.getStatus() == UnitStatusEnum.CANDIDATE) {
            if (disagreement > 9.0) {
                probabilities.put("ISOLATION_AND_NEUTRALIZATION", 0.85);
                probabilities.put("PERSUASION_AND_MEMORY_WIPE", 0.45);
                probabilities.put("MONITORING_ONLY", 0.10);
                response.setSuccessRate(0.87);
                response.setRecommendedAction("ISOLATION_AND_NEUTRALIZATION");
                response.setPrediction("Кандидат с критическим индексом несогласия (" + disagreement + "). Высокий риск пробуждения. Требуется немедленная изоляция.");
            } else if (disagreement > 8.5) {
                probabilities.put("PERSUASION_AND_MEMORY_WIPE", 0.65);
                probabilities.put("ISOLATION_AND_NEUTRALIZATION", 0.35);
                probabilities.put("MONITORING_ONLY", 0.25);
                response.setSuccessRate(0.72);
                response.setRecommendedAction("PERSUASION_AND_MEMORY_WIPE");
                response.setPrediction("Кандидат с повышенным индексом несогласия (" + disagreement + "). Возможно убеждение с очисткой памяти.");
            }
        } else if (unit.getStatus() == UnitStatusEnum.AWAKENED) {
            probabilities.put("SENTINEL_INTERVENTION", 0.95);
            probabilities.put("AGENT_SMITH_NEUTRALIZATION", 0.75);
            probabilities.put("NEGOTIATION", 0.15);
            response.setSuccessRate(0.82);
            response.setRecommendedAction("SENTINEL_INTERVENTION");
            response.setPrediction("ПРОСНУВШИЙСЯ обнаружен. Требуется внешнее вмешательство Сентинелей.");
        } else if (unit.getStatus() == UnitStatusEnum.THE_ONE) {
            probabilities.put("SYSTEM_REBOOT", 0.89);
            probabilities.put("ZION_DESTRUCTION", 0.67);
            probabilities.put("NEGOTIATION", 0.45);
            response.setSuccessRate(0.91);
            response.setRecommendedAction("SYSTEM_REBOOT");
            response.setPrediction("ОБНАРУЖЕН ИЗБРАННЫЙ. Требуется решение Архитектора о перезагрузке системы.");
        } else if (unit.getStatus() == UnitStatusEnum.SUSPICIOUS) {
            probabilities.put("MONITORING", 0.80);
            probabilities.put("AGENT_INVESTIGATION", 0.60);
            probabilities.put("NO_ACTION", 0.40);
            response.setSuccessRate(0.75);
            response.setRecommendedAction("MONITORING");
            response.setPrediction("Подозрительная активность. Рекомендуется усиленный мониторинг.");
        }

        response.setActionProbabilities(probabilities);

        return response;
    }

    @Transactional(readOnly = true)
    public List<OracleRequest> getPendingRequests() {
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
import { useState, useEffect } from 'react';
import {
  Card, CardContent, Grid, Typography, Button, Stack,
  Box, Chip, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, 
  FormControl, InputLabel, Paper, Divider
} from '@mui/material';
import {
  getCandidateUnits,
  getHighDisagreementUnits,
  requestOraclePrediction,
  processPrediction,
  getPendingOracleRequests,
  getForecastsByUnit,
  selectChosenOne,
  requestSentinelStrike
} from '../../api/client';
import { Unit, UnitStatusEnum, RoleEnum, OracleRequest, Forecast } from '../../types/types';
import { useAuth } from '../../auth/useAuth';
import ForecastDisplay from '../../components/ForecastDisplay';

export default function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Unit[]>([]);
  const [highDisagreement, setHighDisagreement] = useState<Unit[]>([]);
  const [pendingRequests, setPendingRequests] = useState<OracleRequest[]>([]);
  const [unitForecasts, setUnitForecasts] = useState<Map<number, Forecast[]>>(new Map()); // Новое состояние для прогнозов
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [forecastDialog, setForecastDialog] = useState(false);
  const [forecastText, setForecastText] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [sentinelDialog, setSentinelDialog] = useState(false);
  const [sentinelData, setSentinelData] = useState({
    targetCoordinates: '',
    sentinelCount: 1,
    priority: 'MEDIUM'
  });
  const [viewingForecastsForUnit, setViewingForecastsForUnit] = useState<number | null>(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const [candidatesData, highDisData, pendingData] = await Promise.all([
        getCandidateUnits(),
        getHighDisagreementUnits(),
        getPendingOracleRequests()
      ]);
      setCandidates(candidatesData);
      setHighDisagreement(highDisData);
      setPendingRequests(pendingData);
      
      // Загружаем прогнозы для всех юнитов
      await loadForecastsForUnits([...candidatesData, ...highDisData]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки кандидатов');
    } finally {
      setLoading(false);
    }
  };

  // Новая функция для загрузки прогнозов
  const loadForecastsForUnits = async (units: Unit[]) => {
    try {
      const forecastsMap = new Map<number, Forecast[]>();
      
      // Для каждого юнита загружаем прогнозы
      for (const unit of units) {
        try {
          const forecasts = await getForecastsByUnit(unit.id);
          if (forecasts && forecasts.length > 0) {
            forecastsMap.set(unit.id, forecasts);
          }
        } catch (err) {
          console.warn(`Не удалось загрузить прогнозы для юнита ${unit.id}:`, err);
        }
      }
      
      setUnitForecasts(forecastsMap);
    } catch (err) {
      console.error('Ошибка загрузки прогнозов:', err);
    }
  };

  // Функция для загрузки прогнозов конкретного юнита
  const loadUnitForecasts = async (unitId: number) => {
    try {
      const forecasts = await getForecastsByUnit(unitId);
      setUnitForecasts(prev => new Map(prev).set(unitId, forecasts));
    } catch (err) {
      console.error('Ошибка загрузки прогнозов:', err);
    }
  };

  const handleRequestOracle = async (unitId: number) => {
    try {
      await requestOraclePrediction(unitId, user?.id || 1);
      alert('Запрос к Оракулу отправлен');
      await loadCandidates();
    } catch (err) {
      setError('Ошибка запроса к Оракулу');
    }
  };

  const handleProcessPrediction = async () => {
    if (!selectedRequestId) return;
    try {
      await processPrediction(selectedRequestId, forecastText);
      setForecastDialog(false);
      setForecastText('');
      setSelectedRequestId(null);
      alert('Прогноз обработан');
      await loadCandidates();
    } catch (err) {
      setError('Ошибка обработки прогноза');
    }
  };

  const handleSentinelStrike = async () => {
    if (!selectedUnit) return;
    try {
      await requestSentinelStrike(
        sentinelData.targetCoordinates,
        sentinelData.sentinelCount,
        sentinelData.priority,
        user?.id || 1
      );
      setSentinelDialog(false);
      alert('Запрос на удар сентинелей отправлен');
    } catch (err) {
      setError('Ошибка отправки запроса');
    }
  };

  const handleSelectChosenOne = async (unitId: number) => {
    try {
      await selectChosenOne(unitId, user?.id || 1, 1);
      alert('Избранный выбран');
      await loadCandidates();
    } catch (err) {
      setError('Ошибка выбора Избранного');
    }
  };

  // Функция для получения последнего прогноза юнита
  const getLatestForecast = (unitId: number): Forecast | null => {
    const forecasts = unitForecasts.get(unitId);
    if (!forecasts || forecasts.length === 0) return null;
    
    // Сортируем по дате создания, берем последний
    return forecasts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управление кандидатами
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Кандидаты с высоким индексом несогласия */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Кандидаты с высоким индексом несогласия (больше 8.5)
        </Typography>
        <Grid container spacing={2}>
          {highDisagreement.map(unit => {
            const latestForecast = getLatestForecast(unit.id);
            const hasForecasts = unitForecasts.has(unit.id);
            
            return (
              <Grid item xs={12} md={6} key={unit.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Юнит #{unit.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Индекс несогласия: {unit.disagreementIndex.toFixed(2)}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1} alignItems="center">
                      <Chip 
                        label={unit.status} 
                        size="small" 
                        color={unit.disagreementIndex > 9.5 ? "error" : "warning"}
                      />
                      <Chip 
                        label={`Индекс: ${unit.disagreementIndex.toFixed(1)}`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Stack>
                    
                    {/* Отображение прогноза */}
                    {unitForecasts.has(unit.id) && (
                      <ForecastDisplay 
                        forecasts={unitForecasts.get(unit.id)!}
                        unitId={unit.id}
                        maxDisplay={1}
                      />
                    )}
                    
                    {/* Кнопка просмотра всех прогнозов */}
                    {hasForecasts && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setViewingForecastsForUnit(unit.id)}
                        sx={{ mt: 1 }}
                      >
                        Показать все прогнозы ({unitForecasts.get(unit.id)?.length || 0})
                      </Button>
                    )}
                    
                    <Stack spacing={1} mt={2}>
                      {user?.role === RoleEnum.AGENT_SMITH && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleRequestOracle(unit.id)}
                          disabled={pendingRequests.some(req => req.unitId === unit.id)}
                        >
                          {pendingRequests.some(req => req.unitId === unit.id) 
                            ? 'Ожидает ответа Оракула' 
                            : 'Запросить прогноз Оракула (UC-202)'}
                        </Button>
                      )}

                      {user?.role === RoleEnum.MONITOR && unit.status === UnitStatusEnum.AWAKENED && (
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedUnit(unit);
                            setSentinelDialog(true);
                          }}
                        >
                          Запросить удар сентинелей (UC-204)
                        </Button>
                      )}

                      {user?.role === RoleEnum.ARCHITECT && unit.disagreementIndex > 9 && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleSelectChosenOne(unit.id)}
                        >
                          Выбрать как Избранного
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Все кандидаты */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Все кандидаты
        </Typography>
        <Grid container spacing={2}>
          {candidates.map(unit => {
            const latestForecast = getLatestForecast(unit.id);
            
            return (
              <Grid item xs={12} md={4} key={unit.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Юнит #{unit.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Досье: {unit.dossier || 'Нет данных'}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip label={unit.status} size="small" />
                      <Chip label={`Индекс: ${unit.disagreementIndex.toFixed(1)}`} size="small" variant="outlined" />
                    </Stack>
                    
                    {unitForecasts.has(unit.id) && (
                      <ForecastDisplay 
                        forecasts={unitForecasts.get(unit.id)!}
                        unitId={unit.id}
                        maxDisplay={1}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Для Оракула: ожидающие запросы */}
      {user?.role === RoleEnum.ORACLE && pendingRequests.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Ожидающие запросы на прогноз
          </Typography>
          <Grid container spacing={2}>
            {pendingRequests.map(request => (
              <Grid item xs={12} md={6} key={request.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">
                      Запрос #{request.id} для Юнита #{request.unitId}
                    </Typography>
                    {request.forecast && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.800', borderRadius: 1 }}>
                        <Typography variant="body2">
                          Прогноз: {request.forecast.forecast}
                        </Typography>
                      </Box>
                    )}
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => {
                        setSelectedRequestId(request.id);
                        setForecastDialog(true);
                      }}
                    >
                      {request.forecast ? 'Обновить прогноз' : 'Обработать запрос'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Диалог просмотра всех прогнозов юнита */}
      <Dialog 
        open={viewingForecastsForUnit !== null} 
        onClose={() => setViewingForecastsForUnit(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Прогнозы Оракула для Юнита #{viewingForecastsForUnit}
        </DialogTitle>
        <DialogContent>
          {viewingForecastsForUnit && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {unitForecasts.get(viewingForecastsForUnit)?.map((forecast, index) => (
                <Paper key={forecast.id} sx={{ p: 2, bgcolor: 'grey.900' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle2" color="primary">
                      Прогноз #{index + 1}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(forecast.createdAt).toLocaleString()}
                    </Typography>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {forecast.forecast}
                  </Typography>
                </Paper>
              ))}
              
              {(!unitForecasts.get(viewingForecastsForUnit) || unitForecasts.get(viewingForecastsForUnit)?.length === 0) && (
                <Alert severity="info">Прогнозы отсутствуют</Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingForecastsForUnit(null)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог прогноза Оракула */}
      <Dialog open={forecastDialog} onClose={() => setForecastDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRequestId ? 'Прогноз Оракула' : 'Новый прогноз'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={6}
            fullWidth
            value={forecastText}
            onChange={(e) => setForecastText(e.target.value)}
            placeholder="Введите прогноз с вариантами действий и вероятностями успеха...
            
Пример:
1. Предложение синей таблетки - 85% успеха
2. Изоляция от системы - 70% успеха
3. Нейтрализация - 95% успеха

Рекомендация: Вариант 1"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForecastDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleProcessPrediction}
            variant="contained"
            disabled={!forecastText.trim()}
          >
            {selectedRequestId ? 'Обновить прогноз' : 'Отправить прогноз'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог запроса удара сентинелей */}
      <Dialog open={sentinelDialog} onClose={() => setSentinelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Запрос удара сентинелей</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Координаты цели"
              fullWidth
              value={sentinelData.targetCoordinates}
              onChange={(e) => setSentinelData({...sentinelData, targetCoordinates: e.target.value})}
              placeholder="X,Y,Z"
              helperText="Пример: -122.4194,37.7749,150"
            />
            <TextField
              label="Количество сентинелей"
              type="number"
              fullWidth
              value={sentinelData.sentinelCount}
              onChange={(e) => setSentinelData({...sentinelData, sentinelCount: parseInt(e.target.value) || 1})}
              inputProps={{ min: 1, max: 50 }}
              helperText="От 1 до 50 сентинелей"
            />
            <FormControl fullWidth>
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={sentinelData.priority}
                onChange={(e) => setSentinelData({...sentinelData, priority: e.target.value})}
                label="Приоритет"
              >
                <MenuItem value="LOW">Низкий</MenuItem>
                <MenuItem value="MEDIUM">Средний</MenuItem>
                <MenuItem value="HIGH">Высокий</MenuItem>
                <MenuItem value="CRITICAL">Критический</MenuItem>
              </Select>
            </FormControl>
            
            {selectedUnit && (
              <Alert severity="info">
                Цель: Юнит #{selectedUnit.id} (Индекс: {selectedUnit.disagreementIndex.toFixed(2)})
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSentinelDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleSentinelStrike}
            variant="contained"
            color="error"
            disabled={!sentinelData.targetCoordinates.trim()}
          >
            Отправить запрос на удар
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
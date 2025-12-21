import { useState, useEffect } from 'react';
import {
  Card, CardContent, Grid, Typography, Button, Stack,
  Box, Chip, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel
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
import { Unit, UnitStatusEnum, RoleEnum, OracleRequest } from '../../types/types';
import { useAuth } from '../../auth/useAuth';

export default function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Unit[]>([]);
  const [highDisagreement, setHighDisagreement] = useState<Unit[]>([]);
  const [pendingRequests, setPendingRequests] = useState<OracleRequest[]>([]);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки кандидатов');
    } finally {
      setLoading(false);
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
      await processPrediction(selectedRequestId);
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
      await selectChosenOne(unitId, user?.id || 1, 1); // 1 - текущая итерация матрицы
      alert('Избранный выбран');
      await loadCandidates();
    } catch (err) {
      setError('Ошибка выбора Избранного');
    }
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
          {highDisagreement.map(unit => (
            <Grid item xs={12} md={4} key={unit.id}>
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
                  
                  <Stack spacing={1} mt={2}>
                    {user?.role === RoleEnum.AGENT_SMITH && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleRequestOracle(unit.id)}
                      >
                        Запросить прогноз Оракула (UC-202)
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
          ))}
        </Grid>
      </Box>

      {/* Все кандидаты */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Все кандидаты
        </Typography>
        <Grid container spacing={2}>
          {candidates.map(unit => (
            <Grid item xs={12} md={4} key={unit.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Юнит #{unit.id}
                  </Typography>
                  <Typography variant="body2">
                    Досье: {unit.dossier || 'Нет данных'}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip label={unit.status} size="small" />
                    <Chip label={`Индекс: ${unit.disagreementIndex.toFixed(1)}`} size="small" variant="outlined" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
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
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => {
                        setSelectedRequestId(request.id);
                        setForecastDialog(true);
                      }}
                    >
                      Обработать запрос
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Диалог прогноза Оракула */}
      <Dialog open={forecastDialog} onClose={() => setForecastDialog(false)}>
        <DialogTitle>Прогноз Оракула</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            value={forecastText}
            onChange={(e) => setForecastText(e.target.value)}
            placeholder="Введите прогноз с вариантами действий и вероятностями..."
            sx={{ mt: 2, minWidth: 400 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForecastDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleProcessPrediction}
            variant="contained"
            disabled={!forecastText.trim()}
          >
            Отправить прогноз
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог запроса удара сентинелей */}
      <Dialog open={sentinelDialog} onClose={() => setSentinelDialog(false)}>
        <DialogTitle>Запрос удара сентинелей</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: 400 }}>
            <TextField
              label="Координаты цели"
              fullWidth
              value={sentinelData.targetCoordinates}
              onChange={(e) => setSentinelData({...sentinelData, targetCoordinates: e.target.value})}
              placeholder="X,Y,Z"
            />
            <TextField
              label="Количество сентинелей"
              type="number"
              fullWidth
              value={sentinelData.sentinelCount}
              onChange={(e) => setSentinelData({...sentinelData, sentinelCount: parseInt(e.target.value) || 1})}
              inputProps={{ min: 1 }}
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
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSentinelDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleSentinelStrike}
            variant="contained"
            disabled={!sentinelData.targetCoordinates.trim()}
          >
            Отправить запрос
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

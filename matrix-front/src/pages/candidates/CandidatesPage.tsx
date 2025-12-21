import { useState, useEffect } from 'react';
import {
  Card, CardContent, Grid, Typography, Button, Stack,
  Box, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import {
  getCandidateUnits,
  getHighDisagreementUnits,
  requestOraclePrediction,
  processPrediction,
  getPendingOracleRequests,
  getForecastsByUnit
} from '../../api';
import { ApiUnit, UnitStatusEnum, Role } from '../../types/types';
import { useAuth } from '../../auth/useAuth';

export default function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<ApiUnit[]>([]);
  const [highDisagreement, setHighDisagreement] = useState<ApiUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<ApiUnit | null>(null);
  const [forecastDialog, setForecastDialog] = useState(false);
  const [forecastText, setForecastText] = useState('');

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const [candidatesData, highDisData] = await Promise.all([
        getCandidateUnits(),
        getHighDisagreementUnits()
      ]);
      setCandidates(candidatesData);
      setHighDisagreement(highDisData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки кандидатов');
    } finally {
      setLoading(false);
    }
  };

  // UC-202: Агент Смит запрашивает прогноз у Оракула
  const handleRequestOracle = async (unitId: number) => {
    try {
      await requestOraclePrediction(unitId, 1); // Временный ID пользователя
      alert('Запрос к Оракулу отправлен');
    } catch (err) {
      setError('Ошибка запроса к Оракулу');
    }
  };

  // UC-202: Оракул обрабатывает прогноз
  const handleProcessPrediction = async (requestId: number) => {
    try {
      await processPrediction(requestId, forecastText);
      setForecastDialog(false);
      setForecastText('');
      alert('Прогноз обработан');
    } catch (err) {
      setError('Ошибка обработки прогноза');
    }
  };

  // UC-204: Запрос удара сентинелей
  const handleSentinelStrike = async (unitId: number) => {
    // Мок - должен вызывать endpoint для сентинелей
    alert(`Запрос на удар сентинелей для юнита ${unitId} отправлен`);
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

      {/* Кандидаты с высоким индексом несогласия (F-201) */}
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
                    Индекс несогласия: {unit.disagreementIndex}
                  </Typography>
                  <Chip 
                    label={unit.status} 
                    size="small" 
                    sx={{ mt: 1 }}
                    color={unit.disagreementIndex > 9.5 ? "error" : "warning"}
                  />
                  
                  {user?.role === "AGENT_SMITH" && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => handleRequestOracle(unit.id)}
                    >
                      Запросить прогноз Оракула (UC-202)
                    </Button>
                  )}

                  {user?.role === "MONITOR" && unit.status === UnitStatusEnum.AWAKENED && (
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => handleSentinelStrike(unit.id)}
                    >
                      Запросить удар сентинелей (UC-204)
                    </Button>
                  )}
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
                    Досье: {unit.dossier}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip label={unit.status} size="small" />
                    <Chip label={`Индекс: ${unit.disagreementIndex}`} size="small" />
                  </Stack>

                  {/* Действия для Оракула */}
                  {user?.role === "ORACLE" && unit.oracleRequests?.length > 0 && (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => {
                        setSelectedUnit(unit);
                        setForecastDialog(true);
                      }}
                    >
                      Обработать запрос
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForecastDialog(false)}>Отмена</Button>
          <Button 
            onClick={() => selectedUnit && selectedUnit.oracleRequests.length > 0 && handleProcessPrediction(selectedUnit.oracleRequests[0].id)}
            variant="contained"
            disabled={!selectedUnit || selectedUnit.oracleRequests.length === 0}
          >
            Отправить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
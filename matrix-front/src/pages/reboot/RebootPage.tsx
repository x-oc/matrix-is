import { useState, useEffect } from 'react';
import {
  Card, CardContent, Button, Grid, Typography, Stack,
  Box, Alert, RadioGroup, FormControlLabel, Radio,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, List, ListItem, ListItemText, Divider
} from '@mui/material';
import {
  getAllAudits,
  initiateAudit,
  getPointOfNoReturnAnalysis,
  getCandidateUnits,
  selectChosenOne,
  getAllUnits
} from '../../api/client';
import { SystemAudit, Unit, RoleEnum } from '../../types/types';
import { useAuth } from '../../auth/useAuth';

export default function RebootPage() {
  const { user } = useAuth();
  const [audits, setAudits] = useState<SystemAudit[]>([]);
  const [candidates, setCandidates] = useState<Unit[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [interviewText, setInterviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewDialog, setInterviewDialog] = useState(false);
  const [analysisDialog, setAnalysisDialog] = useState(false);
  const [pointOfNoReturn, setPointOfNoReturn] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [auditsData, unitsData] = await Promise.all([
        getAllAudits(),
        getAllUnits()
      ]);
      setAudits(auditsData);
      setCandidates(unitsData.filter(u => u.status === 'CANDIDATE' || u.disagreementIndex > 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAudit = async () => {
    try {
      await initiateAudit();
      alert('Аудит запущен');
      await loadData();
    } catch (err) {
      setError('Ошибка запуска аудита');
    }
  };

  const handleGetPointOfNoReturn = async (auditId: number) => {
    try {
      const analysis = await getPointOfNoReturnAnalysis(auditId);
      setPointOfNoReturn(analysis);
      setAnalysisDialog(true);
    } catch (err) {
      setError('Ошибка получения анализа');
    }
  };

  const handleSelectChosenOne = async () => {
    if (!selectedCandidate) {
      alert('Выберите кандидата');
      return;
    }
    try {
      await selectChosenOne(
        selectedCandidate,
        user?.id || 1,
        1 // matrixIterationId
      );
      alert('Избранный выбран');
      setSelectedCandidate(null);
      await loadData();
    } catch (err) {
      setError('Ошибка выбора Избранного');
    }
  };

  const submitFinalDecision = () => {
    console.log('Решение по интервью:', interviewText);
    setInterviewDialog(false);
    setInterviewText('');
    alert('Решение зафиксировано');
  };

  if (user?.role !== RoleEnum.ARCHITECT) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Доступ запрещен. Только Архитектор может управлять перезагрузкой.
      </Alert>
    );
  }

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
        Управление перезагрузкой системы
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* UC-301: Аудит системы */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Системный аудит (UC-301)
              </Typography>
              <Stack spacing={2}>
                <Button variant="contained" onClick={handleStartAudit}>
                  Запустить полный аудит
                </Button>
                
                <List>
                  {audits.map(audit => (
                    <Box key={audit.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <div>
                          <Typography variant="subtitle2">
                            Тип: {audit.auditType}
                          </Typography>
                          <Typography variant="body2">
                            Статус: {audit.status}
                          </Typography>
                          <Typography variant="body2">
                            Стабильность: {audit.stabilityScore}/100
                          </Typography>
                        </div>
                        
                        <Stack spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleGetPointOfNoReturn(audit.id)}
                          >
                            Анализ точки невозврата
                          </Button>
                        </Stack>
                      </Stack>
                      
                      {audit.pointOfNoReturn && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          Точка невозврата достигнута!
                        </Alert>
                      )}
                    </Box>
                  ))}
                </List>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* UC-302: Выбор Избранного */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Выбор Избранного (UC-302)
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Кандидаты для выбора (индекс несогласия больше 8):
              </Typography>
              
              {candidates.length === 0 ? (
                <Alert severity="info">Нет подходящих кандидатов</Alert>
              ) : (
                <>
                  <RadioGroup 
                    value={selectedCandidate} 
                    onChange={(e) => setSelectedCandidate(Number(e.target.value))}
                    sx={{ mb: 2 }}
                  >
                    {candidates.map(candidate => (
                      <FormControlLabel
                        key={candidate.id}
                        value={candidate.id}
                        control={<Radio />}
                        label={`Юнит #${candidate.id} (Индекс: ${candidate.disagreementIndex.toFixed(2)})`}
                      />
                    ))}
                  </RadioGroup>
                  
                  <Button
                    variant="contained"
                    onClick={handleSelectChosenOne}
                    disabled={!selectedCandidate}
                    sx={{ mt: 2 }}
                  >
                    Выбрать Избранного
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* UC-304: Финальное интервью */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Финальное интервью (UC-304)
              </Typography>
              <Button variant="contained" onClick={() => setInterviewDialog(true)}>
                Начать финальное интервью
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Диалог финального интервью */}
      <Dialog open={interviewDialog} onClose={() => setInterviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Финальное интервью с Избранным</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Предоставьте Избранному информацию о предыдущих итерациях и последствиях выбора.
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={interviewText}
            onChange={(e) => setInterviewText(e.target.value)}
            placeholder="Введите решение Избранного и свои комментарии..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterviewDialog(false)}>Отмена</Button>
          <Button onClick={submitFinalDecision} variant="contained">
            Зафиксировать решение
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог анализа точки невозврата */}
      <Dialog open={analysisDialog} onClose={() => setAnalysisDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Анализ точки невозврата</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {pointOfNoReturn || 'Загрузка анализа...'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

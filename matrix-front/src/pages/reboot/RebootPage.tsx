import { useState, useEffect } from 'react';
import {
  Card, CardContent, Button, Grid, Typography, Stack,
  Box, Alert, RadioGroup, FormControlLabel, Radio,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import {
  getAllAudits,
  initiateAudit,
  updateAuditStatus,
  selectChosenOne,
  getAllUnits
} from '../../api';
import { SystemAudit, ApiUnit, Role } from '../../types/types';
import { useAuth } from '../../auth/useAuth';

export default function RebootPage() {
  const { user } = useAuth();
  const [audits, setAudits] = useState<SystemAudit[]>([]);
  const [candidates, setCandidates] = useState<ApiUnit[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [decision, setDecision] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      // Фильтруем кандидатов для выбора Избранного
      setCandidates(unitsData.filter(u => u.status === 'Candidate'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // UC-301: Инициация аудита
  const handleStartAudit = async () => {
    try {
      await initiateAudit(
        'FULL_SYSTEM_AUDIT',
        75, // stabilityScore
        false, // pointOfNoReturn
        1, // initiatedById (временное значение)
        'Полный аудит системы', // auditData
        'STARTED' // status
      );
      await loadData();
      alert('Аудит запущен');
    } catch (err) {
      alert('Ошибка запуска аудита');
    }
  };

  // UC-302: Выбор Избранного
  const handleSelectChosenOne = async () => {
    if (!selectedCandidate) {
      alert('Выберите кандидата');
      return;
    }
    try {
      await selectChosenOne(
        selectedCandidate,
        1, // selectedById (временное значение)
        1 // matrixIterationId (временное значение)
      );
      alert('Избранный выбран');
      setSelectedCandidate(null);
    } catch (err) {
      alert('Ошибка выбора Избранного');
    }
  };

  // UC-304: Финальное интервью
  const handleFinalInterview = () => {
    setDialogOpen(true);
  };

  const submitFinalDecision = () => {
    // Здесь должен быть вызов API для сохранения решения
    console.log('Решение:', decision);
    setDialogOpen(false);
    setDecision('');
    alert('Решение зафиксировано');
  };

  if (user?.role !== "ARCHITECT") {
    return (
      <Alert severity="error">
        Доступ запрещен. Только Архитектор может управлять перезагрузкой.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управление перезагрузкой системы
      </Typography>

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
                {audits.map(audit => (
                  <Box key={audit.id} sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                    <Typography variant="subtitle2">
                      Тип: {audit.auditType}
                    </Typography>
                    <Typography variant="body2">
                      Статус: {audit.status}
                    </Typography>
                    <Typography variant="body2">
                      Стабильность: {audit.stabilityScore}
                    </Typography>
                    {audit.pointOfNoReturn && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        Точка невозврата достигнута
                      </Alert>
                    )}
                  </Box>
                ))}
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
                Кандидаты для выбора:
              </Typography>
              <RadioGroup value={selectedCandidate} onChange={(e) => setSelectedCandidate(Number(e.target.value))}>
                {candidates.map(candidate => (
                  <FormControlLabel
                    key={candidate.id}
                    value={candidate.id}
                    control={<Radio />}
                    label={`Юнит #${candidate.id} (Индекс: ${candidate.disagreementIndex})`}
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
              <Button variant="contained" onClick={handleFinalInterview}>
                Начать финальное интервью
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Диалог финального интервью */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Финальное интервью с Избранным</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Предоставьте Избранному информацию о предыдущих итерациях и последствиях выбора.
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="Введите решение Избранного и свои комментарии..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button onClick={submitFinalDecision} variant="contained">
            Зафиксировать решение
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
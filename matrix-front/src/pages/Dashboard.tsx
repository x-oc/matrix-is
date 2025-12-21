import { useState, useEffect } from 'react';
import {
  Card, CardContent, Grid, Typography, Stack, Box,
  Alert, CircularProgress, Paper, Divider, Button
} from '@mui/material';
import { useAuth } from '../auth/useAuth';
import { has } from '../auth/permissions';
import {
  getDashboardSummary,
  createGlitchTicket,
  autoDetectAndCreateTickets,
  getAllTickets,
  getAllUnits
} from '../api/client';
import { RoleEnum, CreateTicketRequest, AnomalyTypeEnum } from '../types/types';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [ticketCount, setTicketCount] = useState(0);
  const [unitCount, setUnitCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [glitchData, setGlitchData] = useState<CreateTicketRequest>({
    title: 'Глитч текстуры',
    description: 'Рябь стен в секторе S-12',
    threatLevel: 1,
    anomalyType: AnomalyTypeEnum.VISUAL_ARTIFACT,
    matrixCoordinates: 'S-12:45.67,89.12'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [summaryData, tickets, units] = await Promise.all([
          getDashboardSummary(),
          getAllTickets(),
          getAllUnits()
        ]);
        setSummary(summaryData);
        setTicketCount(tickets.length);
        setUnitCount(units.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Панель управления
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Обзор системы и основные операции
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Открытые тикеты
              </Typography>
              <Typography variant="h4" color="error">
                {summary?.openTickets || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего тикетов: {ticketCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Кандидаты
              </Typography>
              <Typography variant="h4" color="warning.main">
                {summary?.totalCandidates || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Проснувшиеся: {summary?.awakenedUnits || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Высокий приоритет
              </Typography>
              <Typography variant="h4" color="error">
                {summary?.highPriorityTickets || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Критические тикеты
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Активные пользователи
              </Typography>
              <Typography variant="h4" color="success.main">
                {summary?.activeUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                В системе сейчас
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* UC-101: Kernel creates glitch ticket */}
        {user?.role === RoleEnum.SYSTEM_KERNEL && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Зафиксировать глитч (UC-101)
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <input
                    type="text"
                    value={glitchData.title}
                    onChange={(e) => setGlitchData({...glitchData, title: e.target.value})}
                    placeholder="Заголовок"
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <textarea
                    value={glitchData.description}
                    onChange={(e) => setGlitchData({...glitchData, description: e.target.value})}
                    placeholder="Описание"
                    rows={3}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <input
                    type="text"
                    value={glitchData.matrixCoordinates}
                    onChange={(e) => setGlitchData({...glitchData, matrixCoordinates: e.target.value})}
                    placeholder="Координаты (Сектор:X,Y)"
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <Button
                    variant="contained"
                    onClick={async () => {
                      try {
                        await createGlitchTicket(glitchData);
                        alert('Тикет создан');
                        setGlitchData({
                          title: '',
                          description: '',
                          threatLevel: 1,
                          anomalyType: AnomalyTypeEnum.VISUAL_ARTIFACT,
                          matrixCoordinates: ''
                        });
                      } catch (err) {
                        setError('Ошибка создания тикета');
                      }
                    }}
                  >
                    Создать тикет
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* UC-201: Kernel detect candidate */}
        {user?.role === RoleEnum.SYSTEM_KERNEL && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Обнаружить кандидата (UC-201)
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    onClick={async () => {
                      try {
                        await autoDetectAndCreateTickets();
                        alert('Обнаружение кандидатов запущено');
                      } catch (err) {
                        setError('Ошибка обнаружения кандидата');
                      }
                    }}
                  >
                    Запустить обнаружение кандидатов
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Система автоматически обнаружит юнитов с индексом несогласия больше 8.5
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

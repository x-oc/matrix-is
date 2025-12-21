import { useState, useEffect } from 'react';
import {
  Card, CardContent, Grid, Typography, Stack, Box,
  Alert, CircularProgress, Paper, Divider, Button
} from '@mui/material';
import { useAuth } from '../auth/useAuth';
import { has } from '../auth/permissions';
import {
  getDashboardSummary,
  kernelDetectGlitch,
  kernelDetectCandidate,
  getAllTickets,
  getAllUnits
} from '../api/client';
import { RoleEnum } from '../types/types';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [ticketCount, setTicketCount] = useState(0);
  const [unitCount, setUnitCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [glitchData, setGlitchData] = useState({
    title: 'Глитч текстуры',
    description: 'Рябь стен в секторе S-12',
    massImpact: false
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
        {/* Статистика системы */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Открытые инциденты
              </Typography>
              <Typography variant="h4" color="error">
                {summary?.openIncidents || 0}
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
                {summary?.candidates || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего юнитов: {unitCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Закрыто сегодня
              </Typography>
              <Typography variant="h4" color="success.main">
                {summary?.closedToday || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                За последние 24 часа
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Программы-сироты
              </Typography>
              <Typography variant="h4" color="info.main">
                {summary?.orphanPrograms || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Требуют решения
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
                  <label>
                    <input
                      type="checkbox"
                      checked={glitchData.massImpact}
                      onChange={(e) => setGlitchData({...glitchData, massImpact: e.target.checked})}
                    />
                    Массовый эффект (более 100 юнитов)
                  </label>
                  <Button
                    variant="contained"
                    onClick={async () => {
                      try {
                        await kernelDetectGlitch(glitchData);
                        alert('Тикет создан');
                        setGlitchData({
                          title: '',
                          description: '',
                          massImpact: false
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
                  <input
                    type="text"
                    placeholder="Имя кандидата"
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <input
                    type="number"
                    placeholder="Индекс несогласия"
                    min="0"
                    max="10"
                    step="0.1"
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <Button
                    variant="contained"
                    onClick={async () => {
                      try {
                        await kernelDetectCandidate('Subject', 8.5);
                        alert('Кандидат обнаружен');
                      } catch (err) {
                        setError('Ошибка обнаружения кандидата');
                      }
                    }}
                  >
                    Создать досье
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
import { useState, useEffect } from 'react';
import {
  Card, CardContent, Grid, Typography, Stack, Box,
  Alert, CircularProgress, Paper, Divider
} from '@mui/material';
import { useAuth } from '../auth/useAuth';
import { has } from '../auth/permissions';
import {
  getDashboardSummary,
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
        </Grid>
      </Box>
  );
}
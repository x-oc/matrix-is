// src/pages/reports/ReportsPage.tsx
import { useEffect, useState } from "react";
import { dailySummary, listSimulations, simulationReport } from "@api/client";
import type { Simulation } from "../../types";
import { Card, CardContent, CardActions, Button, Grid, Typography, Stack, Box, Alert, CircularProgress, Paper, Divider, Chip } from "@mui/material";
import { useAuth } from "@auth/useAuth";
import { has } from "@auth/permissions";

export default function ReportsPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  const [summary, setSummary] = useState<string>("…");
  const [sims, setSims] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sum, simList] = await Promise.all([dailySummary(), listSimulations()]);
      setSummary(sum.text);
      setSims(simList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки отчетов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const canViewReports = has(user.role, "REPORTS_VIEW");
  const canRefreshSimReport = has(user.role, "SIM_REPORT_REFRESH"); // обычно только MONITOR

  const getStabilityColor = (stability: number) => {
    if (stability >= 80) return "success";
    if (stability >= 50) return "warning";
    return "error";
  };

  const getStabilityLabel = (stability: number) => {
    if (stability >= 80) return "Стабильная";
    if (stability >= 50) return "Нестабильная";
    return "Критическая";
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
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Отчёты и аналитика
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Мониторинг состояния системы и персональных симуляций
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {canViewReports && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ежедневная сводка для Архитектора (UC-105)
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: 'black',
                    border: '1px solid',
                    borderColor: 'grey.800',
                    borderRadius: 1
                  }}
                >
                  <Typography
                    sx={{
                      whiteSpace: "pre-wrap",
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      color: 'white'
                    }}
                  >
                    {summary}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        )}

        {canViewReports && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Стабильность персональных симуляций (UC-404)
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  {sims.map((s) => (
                    <Card key={s.id} variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {s.title}
                          </Typography>
                          <Chip
                            label={getStabilityLabel(s.stability)}
                            color={getStabilityColor(s.stability) as any}
                            size="small"
                          />
                        </Stack>

                        <Stack direction="row" spacing={3} mb={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Стабильность
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {s.stability.toFixed(1)}/100
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Ресурсы
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {s.resources}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Активность
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {s.activityScore.toFixed(1)}/100
                            </Typography>
                          </Box>
                        </Stack>

                        <Typography variant="caption" color="text.secondary">
                          Последний отчёт: {new Date(s.lastReportAt).toLocaleString()}
                        </Typography>
                      </CardContent>
                      {canRefreshSimReport && (
                        <CardActions>
                          <Button
                            size="small"
                            onClick={async () => {
                              try {
                                await simulationReport(s.id);
                                await reload();
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Ошибка при обновлении отчета');
                              }
                            }}
                          >
                            Обновить отчёт
                          </Button>
                        </CardActions>
                      )}
                    </Card>
                  ))}

                  {sims.length === 0 && (
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          Нет активных симуляций
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          В системе пока нет персональных симуляций для мониторинга
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

import { useEffect, useState } from "react";
import { 
  getArchitectReport, 
  generateDailyReport,
  getLatestReport
} from "../../api/client";
import { Report } from "../../types/types";
import { 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Typography, 
  Stack, 
  Box, 
  Alert, 
  CircularProgress, 
  Paper, 
  Divider,
  TextField
} from "@mui/material";
import { useAuth } from "../../auth/useAuth";
import { has } from "../../auth/permissions";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ru } from "date-fns/locale";

export default function ReportsPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  const [architectReport, setArchitectReport] = useState<any>(null);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodStart, setPeriodStart] = useState<Date>(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const [periodEnd, setPeriodEnd] = useState<Date>(new Date());
  const [generating, setGenerating] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (has(user.role, "GENERATE_REPORTS")) {
        const [architectReportData, latestReportData] = await Promise.all([
          getArchitectReport(),
          getLatestReport()
        ]);
        setArchitectReport(architectReportData);
        setLatestReport(latestReportData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки отчетов');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const report = await generateDailyReport(
        periodStart.toISOString(),
        periodEnd.toISOString()
      );
      setLatestReport(report);
      alert('Отчет сгенерирован');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка генерации отчета');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const canViewReports = has(user.role, "GENERATE_REPORTS");

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box>
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Отчёты и аналитика
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Мониторинг состояния системы и генерация отчетов
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {canViewReports && (
            <>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Генерация ежедневного отчета (UC-105)
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    <Stack spacing={3}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <DateTimePicker
                            label="Начало периода"
                            value={periodStart}
                            onChange={(newValue) => newValue && setPeriodStart(newValue)}
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <DateTimePicker
                            label="Конец периода"
                            value={periodEnd}
                            onChange={(newValue) => newValue && setPeriodEnd(newValue)}
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </Grid>
                      </Grid>
                      
                      <Button
                        variant="contained"
                        onClick={handleGenerateReport}
                        disabled={generating || !periodStart || !periodEnd}
                      >
                        {generating ? 'Генерация...' : 'Сгенерировать отчет'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Отчет для Архитектора
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    {architectReport ? (
                      <Paper
                        sx={{
                          p: 3,
                          backgroundColor: 'black',
                          border: '1px solid',
                          borderColor: 'grey.800',
                          borderRadius: 1,
                          maxHeight: 400,
                          overflow: 'auto'
                        }}
                      >
                        <pre style={{ 
                          margin: 0, 
                          color: '#00ff41',
                          fontFamily: "'Courier New', monospace",
                          fontSize: '0.9rem',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}>
                          {JSON.stringify(architectReport, null, 2)}
                        </pre>
                      </Paper>
                    ) : (
                      <Alert severity="info">Нет данных для отчета</Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Последний отчет
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    {latestReport ? (
                      <Box>
                        <Stack spacing={2}>
                          <div>
                            <Typography variant="subtitle2" color="text.secondary">
                              Период отчета
                            </Typography>
                            <Typography variant="body1">
                              {new Date(latestReport.periodStart).toLocaleString()} - 
                              {new Date(latestReport.periodEnd).toLocaleString()}
                            </Typography>
                          </div>
                          
                          <div>
                            <Typography variant="subtitle2" color="text.secondary">
                              Сгенерирован
                            </Typography>
                            <Typography variant="body1">
                              {new Date(latestReport.createdAt).toLocaleString()}
                            </Typography>
                          </div>
                          
                          <Button 
                            variant="outlined" 
                            onClick={() => {
                              const blob = new Blob([latestReport.generatedData], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `report_${latestReport.id}.txt`;
                              a.click();
                            }}
                          >
                            Скачать отчет
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <Alert severity="info">Нет сгенерированных отчетов</Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {!canViewReports && (
            <Grid item xs={12}>
              <Alert severity="warning">
                У вас нет прав для просмотра отчетов. Обратитесь к Архитектору или Смотрителю.
              </Alert>
            </Grid>
          )}
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}

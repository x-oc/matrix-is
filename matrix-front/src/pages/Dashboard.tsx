import { Card, CardContent, CardActions, Button, Grid, Typography, Stack, Box, Alert, CircularProgress, Paper, Chip, Divider } from "@mui/material";
import Field from "@components/Field";
import { useEffect, useState } from "react";
import { getSummary, kernelDetectGlitch, kernelDetectCandidate } from "@api/client";
import type { AppSummary } from "../types";
import { useAuth } from "@auth/useAuth";
import { has } from "@auth/permissions";

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return null;
  const [s, setS] = useState<AppSummary | null>(null);
  const [title, setTitle] = useState("Глитч текстуры");
  const [desc, setDesc] = useState("Рябь стен");
  const [mass, setMass] = useState(false);
  const [candName, setCandName] = useState("Subject XYZ-777");
  const [dissent, setDissent] = useState(8.6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await getSummary();
        setS(summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки сводки');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
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
        {(has(user.role, "VIEW_DASHBOARD")) && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Сводка системы
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Открытые инциденты
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {s?.openIncidents ?? "…"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Кандидаты
                    </Typography>
                    <Typography variant="h4" color="secondary">
                      {s?.candidates ?? "…"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Программы-сироты
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {s?.orphanPrograms ?? "…"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {has(user.role, "KERNEL_CREATE_GLITCH") && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Зафиксировать глитч (UC-101)
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Field label="Заголовок" value={title} onChange={e => setTitle(e.target.value)} />
                  <Field label="Описание" value={desc} onChange={e => setDesc(e.target.value)} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Массовый эффект
                    </Typography>
                    <Chip
                      label={mass ? "Да" : "Нет"}
                      color={mass ? "error" : "default"}
                      onClick={() => setMass(!mass)}
                      clickable
                    />
                  </Box>
                </Stack>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={async () => {
                    try {
                      await kernelDetectGlitch({ title, description: desc, massImpact: mass });
                      setTitle("Глитч текстуры");
                      setDesc("Рябь стен");
                      setMass(false);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Ошибка при создании тикета');
                    }
                  }}
                >
                  Создать тикет
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}

        {has(user.role, "KERNEL_DETECT_CANDIDATE") && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Обнаружить «Кандидата» (UC-201)
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Field label="Имя" value={candName} onChange={e => setCandName(e.target.value)} />
                  <Field label="Индекс несогласия" type="number" value={dissent} onChange={e => setDissent(Number(e.target.value))} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Уровень угрозы
                    </Typography>
                    <Chip
                      label={dissent >= 9.5 ? "Критический" : dissent >= 7.0 ? "Высокий" : "Низкий"}
                      color={dissent >= 9.5 ? "error" : dissent >= 7.0 ? "warning" : "success"}
                      size="small"
                    />
                  </Box>
                </Stack>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={async () => {
                    try {
                      await kernelDetectCandidate(candName, dissent);
                      setCandName("Subject XYZ-777");
                      setDissent(8.6);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Ошибка при создании досье');
                    }
                  }}
                >
                  Создать досье
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

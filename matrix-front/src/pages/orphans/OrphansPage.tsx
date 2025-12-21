// src/pages/orphans/OrphansPage.tsx
import { useEffect, useState } from "react";
import {
  listOrphans,
  decideOrphan,
  createPersonalSimulation,
  listSimulations
} from "@api/client";
import type { OrphanProgram, Simulation } from "../../types";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Typography,
  Stack,
  TextField,
  Box,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { useAuth } from "@auth/useAuth";
import { has } from "@auth/permissions";

export default function OrphansPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  const [items, setItems] = useState<OrphanProgram[]>([]);
  const [sims, setSims] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // локальное состояние полей создания симуляции — по каждому сироте
  const [simTitle, setSimTitle] = useState<Record<string, string>>({});
  const [simRes, setSimRes] = useState<Record<string, number>>({});

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const [o, s] = await Promise.all([listOrphans(), listSimulations()]);
      setItems(o);
      setSims(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const getTitle = (id: string) => simTitle[id] ?? "Персональная симуляция";
  const getRes = (id: string) => simRes[id] ?? 10;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Saved': return 'success';
      case 'Deleted': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Saved': return 'Сохранена';
      case 'Deleted': return 'Удалена';
      default: return status;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await decideOrphan(deleteConfirm, "Delete");
      await reload();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении программы');
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
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Сироты и Симуляции
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление программами-сиротами и их персональными симуляциями
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {items.map((o) => {
          const sim = o.simulationId ? sims.find((s) => s.id === o.simulationId) : undefined;
          const canDecide = has(user.role, "ORPHANS_VIEW") && has(user.role, "ORPHAN_DECIDE");
          const canCreateSim = has(user.role, "ORPHANS_VIEW") && has(user.role, "SIM_CREATE");

          return (
            <Grid size={{ md: 4, sm: 6, xs: 12 }} key={o.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h3">
                      {o.name}
                    </Typography>
                    <Chip
                      label={getStatusLabel(o.status)}
                      color={getStatusColor(o.status) as any}
                      size="small"
                    />
                  </Stack>

                  {sim && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          Активная симуляция
                        </Typography>
                        <Stack spacing={1}>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {sim.title}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Стабильность
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {sim.stability.toFixed(1)}/100
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Ресурсы
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {sim.resources}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Активность
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {sim.activityScore.toFixed(1)}/100
                              </Typography>
                            </Box>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Последний отчёт: {new Date(sim.lastReportAt).toLocaleString()}
                          </Typography>
                        </Stack>
                      </Box>
                    </>
                  )}
                </CardContent>

                <CardActions sx={{ flexDirection: "column", alignItems: "stretch", gap: 2, p: 2 }}>
                  {/* UC-402 — решение по сироте: MONITOR */}
                  {canDecide && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        Решение по программе (UC-402)
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                          variant="outlined"
                          color="success"
                          onClick={async () => {
                            try {
                              await decideOrphan(o.id, "Save");
                              await reload();
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Ошибка при сохранении программы');
                            }
                          }}
                          disabled={o.status === "Saved"}
                          size="small"
                        >
                          Сохранить
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => setDeleteConfirm(o.id)}
                          disabled={o.status === "Deleted"}
                          size="small"
                        >
                          Удалить
                        </Button>
                      </Stack>
                    </Box>
                  )}

                  {/* UC-403 — создание персональной симуляции: KEYMAKER */}
                  {canCreateSim && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        Создание симуляции (UC-403)
                      </Typography>
                      <Stack spacing={2}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <TextField
                            size="small"
                            label="Название симуляции"
                            value={getTitle(o.id)}
                            onChange={(e) =>
                              setSimTitle((m) => ({ ...m, [o.id]: e.target.value }))
                            }
                            sx={{ flexGrow: 1 }}
                          />
                          <TextField
                            size="small"
                            label="Ресурсы"
                            type="number"
                            value={getRes(o.id)}
                            onChange={(e) =>
                              setSimRes((m) => ({
                                ...m,
                                [o.id]: Number(e.target.value || 0)
                              }))
                            }
                            sx={{ width: { xs: '100%', sm: 120 } }}
                            inputProps={{ min: 1 }}
                          />
                        </Stack>
                        <Button
                          variant="contained"
                          onClick={async () => {
                            try {
                              await createPersonalSimulation(o.id, getTitle(o.id), getRes(o.id));
                              await reload();
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Ошибка при создании симуляции');
                            }
                          }}
                          disabled={o.status !== "Saved" || Boolean(o.simulationId)}
                          fullWidth
                        >
                          Создать симуляцию
                        </Button>
                      </Stack>
                    </Box>
                  )}

                  {/* Подсказка условий для KEYMAKER */}
                  {canCreateSim && (o.status !== "Saved" || o.simulationId) && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="caption">
                        Для создания симуляции программа должна быть «Сохранена» и без существующей симуляции.
                      </Typography>
                    </Alert>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}

        {items.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Программ-сирот не найдено
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  В системе пока нет программ-сирот для управления
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Удаление программы-сироты</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Вы уверены, что хотите удалить эту программу-сироту? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Отмена</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

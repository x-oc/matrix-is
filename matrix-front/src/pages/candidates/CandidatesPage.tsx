import { useEffect, useState } from "react";
import {
  listCandidates,
  oracleForecast,
  agentOfferBluePill,
  sentinelStrikeRequest,
  markAwakened
} from "@api/client";
import type { Candidate, Forecast, CandidateStatus } from "../../types";
import {
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Button,
  Stack,
  Box,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Fade
} from "@mui/material";
import { fmtProb } from "@utils/format";
import { useAuth } from "@auth/useAuth";
import { has } from "@auth/permissions";
import {
  Person,
  Psychology,
  LocalPharmacy,
  Security,
  EmojiPeople,
  Warning,
  Error as ErrorIcon
} from "@mui/icons-material";

export default function CandidatesPage() {
  const { user } = useAuth();

  if (!user) return null;

  const [items, setItems] = useState<Candidate[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const candidates = await listCandidates();
      setItems(candidates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки кандидатов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleAction = async (action: () => Promise<any>, actionName: string, successMessage: string) => {
    try {
      setActionLoading(actionName);
      setError(null);
      await action();
      setSuccess(successMessage);
      await reload();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Ошибка выполнения действия: ${actionName}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Функции проверки доступности действий
  const canForecast = (candidate: Candidate) =>
      has(user.role, "CANDIDATE_FORECAST") &&
      candidate.status === "Candidate";

  const canBluePill = (candidate: Candidate) =>
      has(user.role, "CANDIDATE_BLUE_PILL") &&
      candidate.status === "Candidate" &&
      forecast?.candidateId === candidate.id; // Требуется прогноз от Оракула

  const canStrikeRequest = (candidate: Candidate) =>
      has(user.role, "SENTINEL_STRIKE_REQUEST") &&
      candidate.status === "Awakened";

  const canMarkAwakened = (candidate: Candidate) =>
      (has(user.role, "CANDIDATE_FORECAST") || has(user.role, "CANDIDATE_BLUE_PILL")) &&
      candidate.status === "Candidate" &&
      candidate.dissentIndex >= 8.5; // Только для кандидатов с высоким индексом

  const filteredItems = items.filter(item =>
      filterStatus === "ALL" || item.status === filterStatus
  );

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const getDissentColor = (dissentIndex: number) => {
    if (dissentIndex >= 9.5) return "error";
    if (dissentIndex >= 7.0) return "warning";
    return "success";
  };

  const getDissentLabel = (dissentIndex: number) => {
    if (dissentIndex >= 9.5) return "КРИТИЧЕСКИЙ";
    if (dissentIndex >= 7.0) return "ВЫСОКИЙ";
    return "НИЗКИЙ";
  };

  const getStatusColor = (status: CandidateStatus) => {
    const colors: Record<CandidateStatus, string> = {
      "Candidate": "#2196f3",
      "Awakened": "#ff9800",
      "Neutralized": "#4caf50",
      "InProcessing": "#f44336"
    };
    return colors[status] || "#666";
  };

  if (loading) {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
            sx={{
              background: "linear-gradient(45deg, rgba(10,10,10,0.9) 0%, rgba(26,26,26,0.9) 100%)",
              borderRadius: 2,
              border: "1px solid rgba(0, 255, 65, 0.3)"
            }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress
                size={60}
                thickness={4}
                sx={{
                  color: '#00ff41',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }}
            />
            <Typography
                variant="h6"
                sx={{
                  color: '#00ff41',
                  fontFamily: "'Share Tech Mono', monospace",
                  letterSpacing: '0.1em'
                }}
            >
              ЗАГРУЗКА КАНДИДАТОВ...
            </Typography>
          </Stack>
        </Box>
    );
  }

  return (
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {/* Matrix Background Effect */}
        <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
            linear-gradient(45deg, rgba(10,10,10,0.95) 0%, rgba(26,26,26,0.95) 100%),
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="matrix" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><text x="0" y="15" fill="rgba(0,255,65,0.03)" font-family="monospace" font-size="12">01</text></pattern></defs><rect width="100" height="100" fill="url(%23matrix)"/></svg>')
          `,
              opacity: 0.4,
              zIndex: -1,
              animation: "matrixScroll 20s linear infinite"
            }}
        />

        <Box mb={4}>
          <Fade in timeout={800}>
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 900,
                  background: "linear-gradient(90deg, #00ff41, #00e5ff)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  textAlign: 'center',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  textShadow: '0 0 30px rgba(0, 255, 65, 0.5)'
                }}
            >
              УПРАВЛЕНИЕ КАНДИДАТАМИ
            </Typography>
          </Fade>
          <Fade in timeout={1000}>
            <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  textAlign: 'center',
                  fontFamily: "'Share Tech Mono', monospace",
                  letterSpacing: '0.1em'
                }}
            >
              МОНИТОРИНГ ПОТЕНЦИАЛЬНЫХ УГРОЗ И УПРАВЛЕНИЕ КАНДИДАТАМИ (UC-201..204, 203)
            </Typography>
          </Fade>
        </Box>

        {error && (
            <Fade in timeout={500}>
              <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    border: '2px solid #ff1744',
                    background: 'linear-gradient(45deg, rgba(211, 47, 47, 0.1) 0%, rgba(244, 67, 54, 0.1) 100%)',
                    fontFamily: "'Share Tech Mono', monospace"
                  }}
                  icon={<ErrorIcon />}
              >
                <Typography variant="subtitle2" gutterBottom>
                  СИСТЕМНАЯ ОШИБКА
                </Typography>
                {error}
              </Alert>
            </Fade>
        )}

        {success && (
            <Fade in timeout={500}>
              <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    border: '2px solid #00ff41',
                    background: 'linear-gradient(45deg, rgba(0, 200, 83, 0.1) 0%, rgba(0, 255, 65, 0.1) 100%)',
                    fontFamily: "'Share Tech Mono', monospace"
                  }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  ОПЕРАЦИЯ УСПЕШНА
                </Typography>
                {success}
              </Alert>
            </Fade>
        )}

        <Fade in timeout={1200}>
          <Paper
              sx={{
                p: 2,
                mb: 3,
                background: "linear-gradient(145deg, rgba(26,26,26,0.9) 0%, rgba(42,42,42,0.9) 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(0, 255, 65, 0.3)",
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #00ff41, transparent)',
                  animation: 'scanLine 3s linear infinite'
                }
              }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontWeight: 600,
                    color: '#00e5ff',
                    letterSpacing: '0.05em'
                  }}
              >
                КАНДИДАТЫ ({filteredItems.length})
              </Typography>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel
                    sx={{
                      fontFamily: "'Share Tech Mono', monospace",
                      color: '#00ff41'
                    }}
                >
                  ФИЛЬТР ПО СТАТУСУ
                </InputLabel>
                <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="ФИЛЬТР ПО СТАТУСУ"
                    sx={{
                      fontFamily: "'Share Tech Mono', monospace",
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#00ff41',
                        borderWidth: '2px'
                      }
                    }}
                >
                  <MenuItem value="ALL" sx={{ fontFamily: "'Share Tech Mono', monospace" }}>
                    ВСЕ ({items.length})
                  </MenuItem>
                  {Object.entries(statusCounts).map(([status, count]) => (
                      <MenuItem key={status} value={status} sx={{ fontFamily: "'Share Tech Mono', monospace" }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(status as CandidateStatus)
                              }}
                          />
                          <span>{status} ({count})</span>
                        </Stack>
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Fade>

        <Grid container spacing={3}>
          {filteredItems.map(c => (
              <Grid size={{ md: 4, sm: 6, xs: 12 }} key={c.id}>
                <Fade in timeout={1400}>
                  <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: "linear-gradient(145deg, rgba(26,26,26,0.9) 0%, rgba(42,42,42,0.9) 100%)",
                        backdropFilter: "blur(10px)",
                        border: c.dissentIndex >= 9.5 
                          ? "1px solid rgba(244, 67, 54, 0.5)" 
                          : "1px solid rgba(0, 255, 65, 0.3)",
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: c.dissentIndex >= 9.5
                            ? 'linear-gradient(90deg, transparent, #f44336, transparent)'
                            : 'linear-gradient(90deg, transparent, #00ff41, transparent)',
                          animation: 'scanLine 3s linear infinite'
                        },
                        '&:hover': {
                          borderColor: c.dissentIndex >= 9.5 ? '#f44336' : '#00e5ff',
                          boxShadow: c.dissentIndex >= 9.5 
                            ? '0 8px 30px rgba(244, 67, 54, 0.3)' 
                            : '0 8px 30px rgba(0, 229, 255, 0.3)',
                          transform: 'translateY(-4px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                      className="glitch-effect"
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              fontFamily: "'Rajdhani', sans-serif",
                              fontWeight: 600,
                              color: '#00e5ff'
                            }}
                        >
                          {c.name}
                        </Typography>
                        <Chip
                            label={c.status}
                            color="default"
                            size="small"
                            variant="outlined"
                            sx={{
                              fontFamily: "'Share Tech Mono', monospace",
                              fontWeight: 600,
                              borderWidth: '2px',
                              borderColor: getStatusColor(c.status)
                            }}
                        />
                      </Stack>

                      <Box mb={2}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <Psychology sx={{ color: '#00ff41', fontSize: 18 }} />
                          <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontFamily: "'Share Tech Mono', monospace" }}
                          >
                            ДОСЬЕ
                          </Typography>
                        </Stack>
                        <Typography
                            variant="body2"
                            sx={{ mb: 2 }}
                        >
                          {c.dossier}
                        </Typography>
                      </Box>

                      {/* Индекс десседенста */}
                      <Box mb={2}>
                        <Alert
                            severity={c.dissentIndex >= 9.5 ? "error" : c.dissentIndex >= 7.0 ? "warning" : "info"}
                            icon={c.dissentIndex >= 9.5 ? <Warning /> : undefined}
                            sx={{
                              background: c.dissentIndex >= 9.5 
                                ? 'rgba(244, 67, 54, 0.1)' 
                                : c.dissentIndex >= 7.0 
                                  ? 'rgba(255, 152, 0, 0.1)' 
                                  : 'rgba(33, 150, 243, 0.1)',
                              border: c.dissentIndex >= 9.5 
                                ? '1px solid rgba(244, 67, 54, 0.3)' 
                                : c.dissentIndex >= 7.0 
                                  ? '1px solid rgba(255, 152, 0, 0.3)' 
                                  : '1px solid rgba(33, 150, 243, 0.3)',
                              fontFamily: "'Share Tech Mono', monospace"
                            }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                fontFamily: "'Share Tech Mono', monospace",
                                fontWeight: 600
                              }}
                            >
                              ИНДЕКС ДИССИДЕНТСТВА:
                            </Typography>
                            <Chip
                              label={`${c.dissentIndex.toFixed(1)} (${getDissentLabel(c.dissentIndex)})`}
                              color={getDissentColor(c.dissentIndex) as any}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontFamily: "'Share Tech Mono', monospace",
                                fontWeight: 600,
                                borderWidth: '2px',
                                fontSize: '0.875rem'
                              }}
                            />
                          </Stack>
                          {c.dissentIndex >= 9.5 && (
                            <Typography variant="caption" fontWeight="bold">
                              ТРЕБУЕТСЯ КАРАНТИН (UC-201 АЛЬТ.)
                            </Typography>
                          )}
                        </Alert>
                      </Box>

                      {forecast && forecast.candidateId === c.id && (
                          <>
                            <Divider
                                sx={{
                                  my: 2,
                                  borderColor: 'rgba(0, 255, 65, 0.3)',
                                  borderWidth: '1px'
                                }}
                            />
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                <Psychology sx={{ color: '#00e5ff', fontSize: 20 }} />
                                <Typography
                                    variant="subtitle2"
                                    color="primary"
                                    sx={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}
                                >
                                  ПРОГНОЗ ОРАКУЛА (UC-202)
                                </Typography>
                              </Stack>
                              <Stack spacing={1}>
                                {forecast.options.map((o) => (
                                    <Box key={o.action}>
                                      <Typography
                                          variant="body2"
                                          fontWeight="medium"
                                          sx={{ fontFamily: "'Rajdhani', sans-serif" }}
                                      >
                                        {o.action}
                                      </Typography>
                                      <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ fontFamily: "'Share Tech Mono', monospace" }}
                                      >
                                        ВЕРОЯТНОСТЬ: {fmtProb(o.probability)}
                                      </Typography>
                                    </Box>
                                ))}
                                {forecast.note && (
                                    <Alert
                                        severity="info"
                                        sx={{
                                          mt: 1,
                                          background: 'rgba(0, 229, 255, 0.1)',
                                          border: '1px solid rgba(0, 229, 255, 0.3)',
                                          fontFamily: "'Share Tech Mono', monospace"
                                        }}
                                    >
                                      <Typography variant="caption">
                                        {forecast.note}
                                      </Typography>
                                    </Alert>
                                )}
                              </Stack>
                            </Box>
                          </>
                      )}
                    </CardContent>

                    <CardActions sx={{ flexDirection: "column", alignItems: "stretch", gap: 1, p: 2 }}>
                      <Typography
                          variant="subtitle2"
                          gutterBottom
                          color="text.secondary"
                          sx={{
                            fontFamily: "'Share Tech Mono', monospace",
                            letterSpacing: '0.05em'
                          }}
                      >
                        ДОСТУПНЫЕ ДЕЙСТВИЯ
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {/* UC-202: запрос прогноза — Агент Смит или Оракул */}
                        {canForecast(c) && (
                            <Button
                                variant="outlined"
                                onClick={() =>
                                    handleAction(
                                        () => oracleForecast(c.id).then(setForecast),
                                        `forecast-${c.id}`,
                                        `Прогноз Оракула получен для ${c.name}`
                                    )
                                }
                                disabled={actionLoading === `forecast-${c.id}`}
                                startIcon={<Psychology />}
                                sx={{
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontWeight: 600
                                }}
                            >
                              {actionLoading === `forecast-${c.id}` ? "ПРОГНОЗ..." : "ПРОГНОЗ (UC-202)"}
                            </Button>
                        )}

                        {/* UC-203: синяя таблетка — Агент Смит */}
                        {canBluePill(c) && (
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() =>
                                    handleAction(
                                        () => agentOfferBluePill(c.id),
                                        `bluepill-${c.id}`,
                                        `Синяя таблетка предложена ${c.name}`
                                    )
                                }
                                disabled={actionLoading === `bluepill-${c.id}`}
                                startIcon={<LocalPharmacy />}
                                sx={{
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontWeight: 600
                                }}
                            >
                              {actionLoading === `bluepill-${c.id}` ? "ОБРАБОТКА..." : "СИНЯЯ ТАБЛЕТКА (UC-203)"}
                            </Button>
                        )}

                        {/* UC-204: запрос удара — Смотритель */}
                        {canStrikeRequest(c) && (
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() =>
                                    handleAction(
                                        () => sentinelStrikeRequest(c.id, "Near Zion Sector"),
                                        `strike-${c.id}`,
                                        `Запрос на устранение ${c.name} отправлен`
                                    )
                                }
                                disabled={actionLoading === `strike-${c.id}`}
                                startIcon={<Security />}
                                sx={{
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontWeight: 600
                                }}
                            >
                              {actionLoading === `strike-${c.id}` ? "ЗАПРОС..." : "ЗАПРОСИТЬ УДАР (UC-204)"}
                            </Button>
                        )}

                        {/* Отметить как «Проснувшийся» — для кандидатов с высоким индексом */}
                        {canMarkAwakened(c) && (
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={() =>
                                    handleAction(
                                        () => markAwakened(c.id),
                                        `awaken-${c.id}`,
                                        `${c.name} отмечен как «Проснувшийся»`
                                    )
                                }
                                disabled={actionLoading === `awaken-${c.id}`}
                                startIcon={<EmojiPeople />}
                                sx={{
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontWeight: 600
                                }}
                            >
                              {actionLoading === `awaken-${c.id}` ? "ОБНОВЛЕНИЕ..." : "ОТМЕТИТЬ «ПРОСНУВШИЙСЯ»"}
                            </Button>
                        )}

                        {/* Сообщение, если нет доступных действий */}
                        {!canForecast(c) && !canBluePill(c) && !canStrikeRequest(c) && !canMarkAwakened(c) && (
                            <Alert
                                severity="info"
                                sx={{
                                  fontFamily: "'Share Tech Mono', monospace",
                                  background: 'rgba(0, 255, 65, 0.05)',
                                  border: '1px solid rgba(0, 255, 65, 0.3)'
                                }}
                            >
                              НЕТ ДОСТУПНЫХ ДЕЙСТВИЙ ДЛЯ ДАННОГО СТАТУСА
                            </Alert>
                        )}
                      </Stack>
                    </CardActions>
                  </Card>
                </Fade>
              </Grid>
          ))}

          {filteredItems.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Fade in timeout={800}>
                  <Card
                      sx={{
                        background: "linear-gradient(145deg, rgba(26,26,26,0.9) 0%, rgba(42,42,42,0.9) 100%)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(0, 255, 65, 0.3)",
                        textAlign: 'center',
                        py: 4
                      }}
                  >
                    <CardContent>
                      <Person sx={{ fontSize: 64, color: 'rgba(0, 255, 65, 0.3)', mb: 2 }} />
                      <Typography
                          variant="h6"
                          color="text.secondary"
                          gutterBottom
                          sx={{
                            fontFamily: "'Rajdhani', sans-serif",
                            fontWeight: 600
                          }}
                      >
                        {filterStatus === "ALL" ? "КАНДИДАТОВ НЕТ" : `НЕТ КАНДИДАТОВ СО СТАТУСОМ "${filterStatus}"`}
                      </Typography>
                      <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontFamily: "'Share Tech Mono', monospace"
                          }}
                      >
                        В СИСТЕМЕ ПОКА НЕТ КАНДИДАТОВ ДЛЯ МОНИТОРИНГА
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
          )}
        </Grid>
      </Box>
  );
}
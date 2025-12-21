// src/pages/tickets/TicketsPage.tsx
import { useCallback, useEffect, useState } from "react";
import {
  listTickets,
  monitorClassifyAndAssign,
  mechanicFix,
  agentComplete,
  escalateToArchitect,
  architectDecision,
  monitorClose,
  agentRequestReinforcement
} from "@api/client";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Paper,
  Fade
} from "@mui/material";
import SeverityChip from "@components/SeverityChip";
import StatusChip from "@components/StatusChip";
import type { Role, Severity, Ticket, TicketStatus } from "../../types";
import { useAuth } from "@auth/useAuth";
import { has } from "@auth/permissions";
import {
  BugReport,
  Assignment,
  Engineering,
  Security,
  Architecture,
  Close,
  PriorityHigh,
  Group
} from "@mui/icons-material";

export default function TicketsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [severity, setSeverity] = useState<Severity>(1);
  const [assignTo, setAssignTo] = useState<Role | "">("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tickets = await listTickets();
      setItems(tickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки тикетов');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (selected) {
      setSeverity(selected.severity);
      setAssignTo("");
      setNote("");
    }
  }, [selected]);

  if (!user) return null;

  const handleAction = async (action: () => Promise<unknown>, actionName: string, successMessage: string) => {
    if (!selected) return;

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
      // явно привести статус к общему типу, чтобы TS не сузил его до несовместимого подмножества
      const s = selected ? (selected.status as TicketStatus) : null;
  
      const canClassify = !!selected && has(user.role, "TICKET_CLASSIFY") &&
          s !== null && s !== "CLOSED" && s !== "DONE";
  
    const canEscalate = !!selected && has(user.role, "TICKET_ESCALATE") &&
        s !== null && s !== "CLOSED" && s !== "DONE" && s !== "ESCALATED";
  
    const canDecide = !!selected && has(user.role, "TICKET_DECIDE") &&
        s === "ESCALATED";
  
    const canFix = !!selected && has(user.role, "TICKET_FIX") &&
        s === "IN_PROGRESS" && selected.assigneeRole === "MECHANIC";
  
    const canAgentComplete = !!selected && has(user.role, "TICKET_AGENT_COMPLETE") &&
        s === "IN_PROGRESS" && selected.assigneeRole === "AGENT_SMITH";
  
    const canRequestReinforcement = !!selected && has(user.role, "TICKET_REQUEST_REINFORCEMENT") &&
        s === "IN_PROGRESS" && selected.assigneeRole === "AGENT_SMITH";
  
    const canClose = !!selected && has(user.role, "TICKET_CLOSE") &&
        (s === "FIXED" || s === "DONE");

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

  const getStatusColor = (status: TicketStatus) => {
    const colors: Record<TicketStatus, string> = {
      NEW: "#666",
      ASSIGNED_MONITOR: "#2196f3",
      IN_PROGRESS: "#ff9800",
      FIXED: "#4caf50",
      DONE: "#4caf50",
      UNDER_REVIEW: "#9c27b0",
      ESCALATED: "#f44336",
      AWAITING_DECISION: "#ff5722",
      CLOSED: "#607d8b"
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
              ЗАГРУЗКА ТИКЕТОВ...
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
              УПРАВЛЕНИЕ ИНЦИДЕНТАМИ
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
              МОНИТОРИНГ И ОБРАБОТКА СИСТЕМНЫХ АНОМАЛИЙ
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

        <Grid container spacing={3}>
          {/* Левая панель - список тикетов */}
          <Grid size={{ md: 5, xs: 12 }}>
            <Fade in timeout={1200}>
              <Paper
                  sx={{
                    p: 2,
                    mb: 2,
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
                    ТИКЕТЫ ({filteredItems.length})
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel
                        sx={{
                          fontFamily: "'Share Tech Mono', monospace",
                          color: '#00ff41'
                        }}
                    >
                      ФИЛЬТР
                    </InputLabel>
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="ФИЛЬТР"
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
                                    backgroundColor: getStatusColor(status as TicketStatus)
                                  }}
                              />
                              <span>{status} ({count})</span>
                            </Stack>
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Stack spacing={1}>
                  {filteredItems.length === 0 && (
                      <Card
                          sx={{
                            background: 'rgba(0, 255, 65, 0.05)',
                            border: '1px dashed rgba(0, 255, 65, 0.3)'
                          }}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                          <Typography
                              color="text.secondary"
                              sx={{ fontFamily: "'Share Tech Mono', monospace" }}
                          >
                            {filterStatus === "ALL" ? "ТИКЕТОВ НЕТ" : `НЕТ ТИКЕТОВ СО СТАТУСОМ "${filterStatus}"`}
                          </Typography>
                        </CardContent>
                      </Card>
                  )}
                  {filteredItems.map((t) => (
                      <Card
                          key={t.id}
                          onClick={() => setSelected(t)}
                          sx={{
                            cursor: "pointer",
                            background: "linear-gradient(145deg, rgba(26,26,26,0.9) 0%, rgba(42,42,42,0.9) 100%)",
                            border: selected?.id === t.id ? "2px solid #00e5ff" : "1px solid rgba(0, 255, 65, 0.2)",
                            transition: "all 0.3s ease",
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              border: "1px solid #00e5ff",
                              boxShadow: "0 4px 20px rgba(0, 229, 255, 0.3)",
                              transform: "translateY(-2px)"
                            },
                            '&::before': selected?.id === t.id ? {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '2px',
                              background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
                              animation: 'scanLine 1.5s linear infinite'
                            } : {}
                          }}
                      >
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Typography
                                variant="subtitle1"
                                fontWeight="medium"
                                sx={{ fontFamily: "'Rajdhani', sans-serif" }}
                            >
                              {t.title}
                            </Typography>
                            <StatusChip status={t.status} />
                          </Stack>
                          <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                          >
                            {t.description}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <SeverityChip s={t.severity} />
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontFamily: "'Share Tech Mono', monospace" }}
                            >
                              {t.assigneeRole ?? "НЕ НАЗНАЧЕН"}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                  ))}
                </Stack>
              </Paper>
            </Fade>
          </Grid>

          {/* Правая панель - детали тикета */}
          <Grid size={{ md: 7, xs: 12 }}>
            {selected ? (
                <Fade in timeout={800}>
                  <Card
                      sx={{
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
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{
                              fontFamily: "'Rajdhani', sans-serif",
                              fontWeight: 600,
                              color: '#00e5ff'
                            }}
                        >
                          {selected.title}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <SeverityChip s={selected.severity} />
                          <StatusChip status={selected.status} />
                        </Stack>
                      </Stack>

                      <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                      >
                        {selected.description}
                      </Typography>

                      <Divider
                          sx={{
                            my: 2,
                            borderColor: 'rgba(0, 255, 65, 0.3)',
                            borderWidth: '1px'
                          }}
                      />

                      {/* UC-102 — классификация и назначение (MONITOR) */}
                      {canClassify && (
                          <Box mb={3}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                              <Assignment sx={{ color: '#00ff41', fontSize: 20 }} />
                              <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                  sx={{ fontFamily: "'Share Tech Mono', monospace" }}
                              >
                                КЛАССИФИКАЦИЯ И НАЗНАЧЕНИЕ (UC-102)
                              </Typography>
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={2}>
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel
                                    sx={{
                                      fontFamily: "'Share Tech Mono', monospace",
                                      color: '#00ff41'
                                    }}
                                >
                                  УРОВЕНЬ
                                </InputLabel>
                                <Select
                                    value={severity}
                                    onChange={(e) => setSeverity(Number(e.target.value) as Severity)}
                                    label="УРОВЕНЬ"
                                    sx={{
                                      fontFamily: "'Share Tech Mono', monospace"
                                    }}
                                >
                                  <MenuItem value={1} sx={{ fontFamily: "'Share Tech Mono', monospace" }}>Уровень 1</MenuItem>
                                  <MenuItem value={2} sx={{ fontFamily: "'Share Tech Mono', monospace" }}>Уровень 2</MenuItem>
                                  <MenuItem value={3} sx={{ fontFamily: "'Share Tech Mono', monospace" }}>Уровень 3</MenuItem>
                                </Select>
                              </FormControl>
                              <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel
                                    sx={{
                                      fontFamily: "'Share Tech Mono', monospace",
                                      color: '#00ff41'
                                    }}
                                >
                                  НАЗНАЧИТЬ
                                </InputLabel>
                                <Select
                                    value={assignTo}
                                    onChange={(e) => setAssignTo(e.target.value as Role | "")}
                                    label="НАЗНАЧИТЬ"
                                    sx={{
                                      fontFamily: "'Share Tech Mono', monospace"
                                    }}
                                >
                                  <MenuItem value="" sx={{ fontFamily: "'Share Tech Mono', monospace" }}>
                                    <em>Выберите получателя</em>
                                  </MenuItem>
                                  <MenuItem value="MECHANIC" sx={{ fontFamily: "'Share Tech Mono', monospace" }}>Механику</MenuItem>
                                  <MenuItem value="AGENT_SMITH" sx={{ fontFamily: "'Share Tech Mono', monospace" }}>Агенту Смиту</MenuItem>
                                  <MenuItem value="ARCHITECT" sx={{ fontFamily: "'Share Tech Mono', monospace" }}>Архитектору</MenuItem>
                                </Select>
                              </FormControl>
                            </Stack>
                          </Box>
                      )}

                      <TextField
                          fullWidth
                          label="КОММЕНТАРИЙ / ПАТЧ / ОТЧЁТ"
                          multiline
                          rows={3}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          sx={{ mb: 3 }}
                          InputProps={{
                            sx: {
                              fontFamily: "'Share Tech Mono', monospace"
                            }
                          }}
                          InputLabelProps={{
                            sx: {
                              fontFamily: "'Share Tech Mono', monospace",
                              color: '#00ff41'
                            }
                          }}
                      />

                      <Divider
                          sx={{
                            my: 2,
                            borderColor: 'rgba(0, 255, 65, 0.3)',
                            borderWidth: '1px'
                          }}
                      />

                      <Typography
                          variant="subtitle2"
                          gutterBottom
                          color="text.secondary"
                          sx={{
                            fontFamily: "'Share Tech Mono', monospace",
                            mb: 2
                          }}
                      >
                        ДОСТУПНЫЕ ДЕЙСТВИЯ
                      </Typography>

                      {/* кнопка эскалировать */}
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {/* UC-106 — эскалация Архитектору (MONITOR) */}
                        {canClassify && (
                            <Button
                                variant="outlined"
                                onClick={() => {
                                  if (!assignTo) {
                                    setError("Необходимо выбрать, кому назначить тикет");
                                    return;
                                  }
                                  handleAction(
                                      () => monitorClassifyAndAssign(selected.id, severity, assignTo as Role),
                                      "classify",
                                      "Тикет классифицирован и назначен"
                                  );
                                }}
                                disabled={actionLoading === "classify" || !assignTo}
                                startIcon={<Assignment />}
                                title={!assignTo ? "Необходимо выбрать, кому назначить тикет" : ""}
                            >
                              {actionLoading === "classify" ? "ОБРАБОТКА..." : "ПРИМЕНИТЬ"}
                            </Button>
                        )}

                        {/* UC-107 — решение Архитектора (ARCHITECT) */}
                        {canDecide && (
                            <>
                              <Button
                                  variant="outlined"
                                  onClick={() =>
                                      handleAction(
                                          () => architectDecision(selected.id, "IGNORE", note),
                                          "ignore",
                                          "Архитектор: инцидент проигнорирован"
                                      )
                                  }
                                  disabled={actionLoading === "ignore"}
                                  startIcon={<Architecture />}
                                  sx={{
                                    fontFamily: "'Rajdhani', sans-serif",
                                    fontWeight: 600
                                  }}
                              >
                                {actionLoading === "ignore" ? "ОБРАБОТКА..." : "АРХ.: ИГНОР"}
                              </Button>
                              <Button
                                  variant="outlined"
                                  onClick={() =>
                                      handleAction(
                                          () => architectDecision(selected.id, "ALLOCATE_RESOURCES", note),
                                          "allocate",
                                          "Архитектор: ресурсы выделены"
                                      )
                                  }
                                  disabled={actionLoading === "allocate"}
                                  startIcon={<Architecture />}
                                  sx={{
                                    fontFamily: "'Rajdhani', sans-serif",
                                    fontWeight: 600
                                  }}
                              >
                                {actionLoading === "allocate" ? "ОБРАБОТКА..." : "АРХ.: РЕСУРСЫ"}
                              </Button>
                              <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={() =>
                                      handleAction(
                                          () => architectDecision(selected.id, "DELETE_SECTOR", note),
                                          "delete",
                                          "Архитектор: сектор удалён"
                                      )
                                  }
                                  disabled={actionLoading === "delete"}
                                  startIcon={<Architecture />}
                                  sx={{
                                    fontFamily: "'Rajdhani', sans-serif",
                                    fontWeight: 600
                                  }}
                              >
                                {actionLoading === "delete" ? "ОБРАБОТКА..." : "АРХ.: УДАЛИТЬ СЕКТОР"}
                              </Button>
                            </>
                        )}

                        {/* UC-103 — фикс Механика (MECHANIC) */}
                        {canFix && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                    handleAction(
                                        () => mechanicFix(selected.id, note),
                                        "fix",
                                        "Механик: инцидент исправлен"
                                    )
                                }
                                disabled={actionLoading === "fix"}
                                startIcon={<Engineering />}
                                sx={{
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontWeight: 600
                                }}
                            >
                              {actionLoading === "fix" ? "ИСПРАВЛЕНИЕ..." : "МЕХАНИК: ИСПРАВИТЬ (UC-103)"}
                            </Button>
                        )}

                        {/* UC-104 — завершение Агентом (AGENT_SMITH) */}
                        {canAgentComplete && (
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() =>
                                    handleAction(
                                        () => agentComplete(selected.id, note),
                                        "complete",
                                        "Агент: задание выполнено"
                                    )
                                }
                                disabled={actionLoading === "complete"}
                                startIcon={<Security />}
                                sx={{
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontWeight: 600
                                }}
                            >
                              {actionLoading === "complete" ? "ВЫПОЛНЕНИЕ..." : "АГЕНТ: ВЫПОЛНЕНО (UC-104)"}
                            </Button>
                        )}

                        {/* UC-205 — запрос подкрепления (AGENT_SMITH) */}
                        {canRequestReinforcement && (
                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={() =>
                                    handleAction(
                                        () => agentRequestReinforcement(selected.id),
                                        "reinforcement",
                                        "Запрос подкрепления отправлен"
                                    )
                                }
                                disabled={actionLoading === "reinforcement"}
                                startIcon={<Group />}
                                sx={{
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontWeight: 600
                                }}
                            >
                              {actionLoading === "reinforcement" ? "ЗАПРОС..." : "ЗАПРОСИТЬ ПОДКРЕПЛЕНИЕ (UC-205)"}
                            </Button>
                        )}

                        {/* Закрытие тикета (MONITOR) */}
                        {canClose && (
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() =>
                                    handleAction(
                                        () => monitorClose(selected.id),
                                        "close",
                                        "Тикет успешно закрыт"
                                    )
                                }
                                disabled={actionLoading === "close"}
                                startIcon={<Close />}
                                sx={{
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontWeight: 600
                                }}
                            >
                              {actionLoading === "close" ? "ЗАКРЫТИЕ..." : "ЗАКРЫТЬ ТИКЕТ"}
                            </Button>
                        )}

                        {/* Сообщение, если нет доступных действий */}
                        {!canClassify && !canEscalate && !canDecide && !canFix &&
                            !canAgentComplete && !canRequestReinforcement && !canClose && (
                                <Alert
                                    severity="info"
                                    sx={{
                                      fontFamily: "'Share Tech Mono', monospace",
                                      background: 'rgba(0, 255, 65, 0.05)',
                                      border: '1px solid rgba(0, 255, 65, 0.3)'
                                    }}
                                >
                                  НЕТ ДОСТУПНЫХ ДЕЙСТВИЙ ДЛЯ ДАННОГО СТАТУСА ТИКЕТА
                                </Alert>
                            )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
            ) : (
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
                      <BugReport sx={{ fontSize: 64, color: 'rgba(0, 255, 65, 0.3)', mb: 2 }} />
                      <Typography
                          variant="h6"
                          color="text.secondary"
                          gutterBottom
                          sx={{
                            fontFamily: "'Rajdhani', sans-serif",
                            fontWeight: 600
                          }}
                      >
                        ВЫБЕРИТЕ ТИКЕТ
                      </Typography>
                      <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontFamily: "'Share Tech Mono', monospace"
                          }}
                      >
                        ВЫБЕРИТЕ ТИКЕТ ИЗ СПИСКА СЛЕВА ДЛЯ ПРОСМОТРА ДЕТАЛЕЙ И ВЫПОЛНЕНИЯ ДЕЙСТВИЙ
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
            )}
          </Grid>
        </Grid>
      </Box>
  );
}
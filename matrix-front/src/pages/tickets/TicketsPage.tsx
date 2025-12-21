import { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Grid, MenuItem,
  Select, Stack, Typography, TextField, Alert,
  CircularProgress, Divider, FormControl, InputLabel
} from '@mui/material';
import {
  getAllTickets,
  getTicketsByStatus,
  assignTicket,
  updateTicketStatus,
  escalateMassGlitch,
  addTicketComment,
  getCommentsForTicket
} from '../../api';
import {
  ApiTicket,
  Role,
  AnomalyTypeEnum,
  TicketImportanceEnum,
  TicketStatusEnum
} from '../../types/types';
import { useAuth } from '../../auth/useAuth';

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ApiTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = filterStatus === 'ALL' 
        ? await getAllTickets()
        : await getTicketsByStatus(filterStatus);
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки тикетов');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (ticketId: number) => {
    try {
      const ticketComments = await getCommentsForTicket(ticketId);
      setComments(ticketComments);
    } catch (err) {
      console.error('Ошибка загрузки комментариев:', err);
    }
  };

  const handleAssignTicket = async (ticketId: number, role: string) => {
    try {
      await assignTicket(ticketId, role);
      await loadTickets();
    } catch (err) {
      setError('Ошибка назначения тикета');
    }
  };

  const handleUpdateStatus = async (ticketId: number, status: string) => {
    try {
      await updateTicketStatus(ticketId, status);
      await loadTickets();
    } catch (err) {
      setError('Ошибка обновления статуса');
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;
    try {
      await addTicketComment(selectedTicket.id, 1, newComment); // Временный ID пользователя
      setNewComment('');
      const updatedComments = await getCommentsForTicket(selectedTicket.id);
      setComments(updatedComments);
    } catch (err) {
      setError('Ошибка добавления комментария');
    }
  };

  // Проверка массового глитча (F-103)
  const checkMassGlitch = async (ticketId: number) => {
    try {
      await escalateMassGlitch(ticketId);
      alert('Проверка массового глитча выполнена');
    } catch (err) {
      setError('Ошибка проверки массового глитча');
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
      <Typography variant="h4" gutterBottom>
        Управление тикетами
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={3}>
        {/* Список тикетов */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Все тикеты
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Фильтр по статусу</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Фильтр по статусу"
                >
                  <MenuItem value="ALL">Все</MenuItem>
                  {Object.values(TicketStatusEnum).map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack spacing={2}>
                {tickets.map(ticket => (
                  <Card
                    key={ticket.id}
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: selectedTicket?.id === ticket.id ? 'action.selected' : 'background.paper'
                    }}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      loadComments(ticket.id);
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {ticket.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.anomalyType}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={1}>
                        <Typography variant="caption" color="text.secondary">
                          Статус: {ticket.status}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Уровень: {ticket.threatLevel}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Детали тикета */}
        <Grid item xs={12} md={6}>
          {selectedTicket ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Детали тикета
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <div>
                    <Typography variant="subtitle2" color="text.secondary">
                      Название
                    </Typography>
                    <Typography variant="body1">{selectedTicket.title}</Typography>
                  </div>

                  <div>
                    <Typography variant="subtitle2" color="text.secondary">
                      Описание
                    </Typography>
                    <Typography variant="body1">{selectedTicket.description}</Typography>
                  </div>

                  <div>
                    <Typography variant="subtitle2" color="text.secondary">
                      Уровень угрозы
                    </Typography>
                    <Typography variant="body1">{selectedTicket.threatLevel}</Typography>
                  </div>

                  <div>
                    <Typography variant="subtitle2" color="text.secondary">
                      Тип аномалии
                    </Typography>
                    <Typography variant="body1">{selectedTicket.anomalyType}</Typography>
                  </div>

                  {/* Действия для Monitor (UC-102) */}
                  {user?.role === "MONITOR" && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Классификация и назначение
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Select
                          value=""
                          onChange={(e) => handleAssignTicket(selectedTicket.id, e.target.value)}
                          size="small"
                          displayEmpty
                        >
                          <MenuItem value="">Назначить роль</MenuItem>
                          <MenuItem value="MECHANIC">Механику</MenuItem>
                          <MenuItem value="AGENT_SMITH">Агенту Смиту</MenuItem>
                        </Select>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => checkMassGlitch(selectedTicket.id)}
                        >
                          Проверить массовый глитч (F-103)
                        </Button>
                      </Stack>
                    </Box>
                  )}

                  {/* Действия для Mechanic (UC-102) */}
                  {user?.role === "MECHANIC" && selectedTicket.status === TicketStatusEnum.IN_PROGRESS && (
                    <Button
                      variant="contained"
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'UNDER_REVIEW')}
                    >
                      Отметить как исправленное
                    </Button>
                  )}

                  {/* Действия для Architect (UC-107) */}
                  {user?.role === "ARCHITECT" && selectedTicket.status === TicketStatusEnum.ESCALATED && (
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Решение Архитектора:</Typography>
                      <Button
                        variant="outlined"
                        onClick={() => handleUpdateStatus(selectedTicket.id, 'CLOSED')}
                      >
                        Игнорировать
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                      >
                        Выделить ресурсы
                      </Button>
                    </Stack>
                  )}

                  {/* Комментарии */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Комментарии
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Добавить комментарий"
                      sx={{ mb: 1 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      Добавить
                    </Button>
                    {comments.map(comment => (
                      <Box key={comment.id} sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2">{comment.comment}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  Выберите тикет для просмотра деталей
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
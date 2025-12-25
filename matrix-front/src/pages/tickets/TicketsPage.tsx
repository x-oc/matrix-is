import { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Grid, MenuItem,
  Select, Stack, Typography, TextField, Alert,
  CircularProgress, Divider, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  getAllTickets,
  getTicketsByStatus,
  assignTicket,
  updateTicketStatus,
  escalateMassGlitch,
  addTicketComment,
  getCommentsForTicket,
  createTicket
} from '../../api/client';
import {
  Ticket,
  RoleEnum,
  AnomalyTypeEnum,
  TicketStatusEnum,
  CreateTicketRequest
} from '../../types/types';
import { useAuth } from '../../auth/useAuth';
import StatusChip from '../../components/StatusChip';
import SeverityChip from '../../components/SeverityChip';

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<CreateTicketRequest>({
    title: '',
    description: '',
    threatLevel: 1,
    anomalyType: AnomalyTypeEnum.PHYSICS_GLITCH,
    matrixCoordinates: ''
  });

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
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({...selectedTicket, status});
      }
    } catch (err) {
      setError('Ошибка обновления статуса');
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;
    try {
      await addTicketComment(selectedTicket.id, user?.id || 1, newComment);
      setNewComment('');
      const updatedComments = await getCommentsForTicket(selectedTicket.id);
      setComments(updatedComments);
    } catch (err) {
      setError('Ошибка добавления комментария');
    }
  };

  const handleCreateTicket = async () => {
    try {
      await createTicket(newTicket);
      setCreateDialogOpen(false);
      setNewTicket({
        title: '',
        description: '',
        threatLevel: 1,
        anomalyType: AnomalyTypeEnum.PHYSICS_GLITCH,
        matrixCoordinates: ''
      });
      await loadTickets();
    } catch (err) {
      setError('Ошибка создания тикета');
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

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
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

        <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>
          Создать тикет
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Все тикеты ({tickets.length})
              </Typography>
              
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
                      <Stack direction="row" spacing={1} mt={1} alignItems="center">
                        <StatusChip status={ticket.status} />
                        <SeverityChip s={ticket.threatLevel as any} />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          {selectedTicket ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Детали тикета #{selectedTicket.id}
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
                    <SeverityChip s={selectedTicket.threatLevel as any} />
                  </div>

                  <div>
                    <Typography variant="subtitle2" color="text.secondary">
                      Тип аномалии
                    </Typography>
                    <Typography variant="body1">{selectedTicket.anomalyType}</Typography>
                  </div>

                  <div>
                    <Typography variant="subtitle2" color="text.secondary">
                      Статус
                    </Typography>
                    <StatusChip status={selectedTicket.status} />
                  </div>

                  <div>
                    <Typography variant="subtitle2" color="text.secondary">
                      Координаты
                    </Typography>
                    <Typography variant="body1">{selectedTicket.matrixCoordinates}</Typography>
                  </div>

                  {user?.role === RoleEnum.MONITOR && selectedTicket.status === TicketStatusEnum.NEW && 
                    (selectedTicket.assignedToRole === RoleEnum.MECHANIC || selectedTicket.assignedToRole === RoleEnum.AGENT_SMITH) && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Назначен на роль: {selectedTicket.assignedToRole}
                      </Typography>
                    </Box>
                  )
                  }

                  {user?.role === RoleEnum.MONITOR && selectedTicket.status === TicketStatusEnum.NEW && 
                    selectedTicket.assignedToRole != RoleEnum.MECHANIC && selectedTicket.assignedToRole != RoleEnum.AGENT_SMITH &&  (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Назначить исполнителя
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Select
                          value=""
                          onChange={(e) => handleAssignTicket(selectedTicket.id, e.target.value)}
                          size="small"
                          displayEmpty
                        >
                          <MenuItem value="">Выберите роль</MenuItem>
                          <MenuItem value="MECHANIC">Механику</MenuItem>
                          <MenuItem value="AGENT_SMITH">Агенту Смиту</MenuItem>
                        </Select>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => escalateMassGlitch(selectedTicket.id)}
                        >
                          Проверить массовый глитч
                        </Button>
                      </Stack>
                    </Box>
                  )}

                  {user?.role === RoleEnum.MECHANIC && selectedTicket.status === TicketStatusEnum.IN_PROGRESS && (
                    <Button
                      variant="contained"
                      onClick={() => handleUpdateStatus(selectedTicket.id, TicketStatusEnum.UNDER_REVIEW)}
                    >
                      Отметить как исправленное
                    </Button>
                  )}

                  {user?.role === RoleEnum.AGENT_SMITH && selectedTicket.status === TicketStatusEnum.IN_PROGRESS && (
                    <Button
                      variant="contained"
                      onClick={() => handleUpdateStatus(selectedTicket.id, TicketStatusEnum.UNDER_REVIEW)}
                    >
                      Завершить задание
                    </Button>
                  )}

                  {user?.role === RoleEnum.MONITOR && selectedTicket.status === TicketStatusEnum.UNDER_REVIEW && (
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Проверка результата:</Typography>
                      <Button
                        variant="outlined"
                        onClick={() => handleUpdateStatus(selectedTicket.id, TicketStatusEnum.CLOSED)}
                      >
                        Закрыть тикет
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleUpdateStatus(selectedTicket.id, TicketStatusEnum.ESCALATED)}
                      >
                        Эскалировать Архитектору
                      </Button>
                    </Stack>
                  )}

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
                      <Box key={comment.id} sx={{ mt: 1, p: 1, bgcolor: 'grey.600', borderRadius: 1 }}>
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

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Создание нового тикета</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Название"
              fullWidth
              value={newTicket.title}
              onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
            />
            <TextField
              label="Описание"
              multiline
              rows={3}
              fullWidth
              value={newTicket.description}
              onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
            />
            <TextField
              label="Уровень угрозы (1-3)"
              type="number"
              fullWidth
              value={newTicket.threatLevel}
              onChange={(e) => setNewTicket({...newTicket, threatLevel: parseInt(e.target.value) || 1})}
              inputProps={{ min: 1, max: 3 }}
            />
            <FormControl fullWidth>
              <InputLabel>Тип аномалии</InputLabel>
              <Select
                value={newTicket.anomalyType}
                onChange={(e) => setNewTicket({...newTicket, anomalyType: e.target.value})}
                label="Тип аномалии"
              >
                {Object.values(AnomalyTypeEnum).map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Координаты"
              fullWidth
              value={newTicket.matrixCoordinates}
              onChange={(e) => setNewTicket({...newTicket, matrixCoordinates: e.target.value})}
              placeholder="Сектор:X,Y"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCreateTicket}>Создать</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

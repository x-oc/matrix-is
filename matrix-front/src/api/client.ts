import axios from 'axios';
import {
  User, Ticket, Unit, OracleRequest, Forecast, SystemAudit,
  SentinelTask, Report, ChosenOne, CreateTicketRequest,
  CreateSentinelTaskRequest, LinkTicketUnitRequest, ApiResponse,
  AuthResponse, TicketComment
} from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Интерцептор для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обновления токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });
        const { token } = response.data;
        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', { username, password });
  const { data } = response.data;
  localStorage.setItem('token', data.token);
  localStorage.setItem('userId', data.userId.toString());
  localStorage.setItem('username', data.username);
  localStorage.setItem('role', data.role);
  return data;
};

export const refreshToken = async (token: string): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', null, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

// Tickets
export const createTicket = async (request: CreateTicketRequest): Promise<Ticket> => {
  const response = await api.post<ApiResponse<Ticket>>('/tickets', request);
  return response.data.data;
};

export const getAllTickets = async (): Promise<Ticket[]> => {
  const response = await api.get<ApiResponse<Ticket[]>>('/tickets');
  return response.data.data;
};

export const getTicketsByStatus = async (status: string): Promise<Ticket[]> => {
  const response = await api.get<ApiResponse<Ticket[]>>(`/tickets/status/${status}`);
  return response.data.data;
};

export const assignTicket = async (id: number, role: string): Promise<Ticket> => {
  const response = await api.put<ApiResponse<Ticket>>(`/tickets/${id}/assign`, {
    assignedToRole: role
  });
  return response.data.data;
};

export const updateTicketStatus = async (id: number, status: string): Promise<void> => {
  await api.put<ApiResponse<void>>(`/tickets/${id}/status/${status}`);
};

export const escalateMassGlitch = async (id: number): Promise<void> => {
  await api.post<ApiResponse<void>>(`/tickets/${id}/escalate-mass-glitch`);
};

// Units (Candidates)
export const getAllUnits = async (): Promise<Unit[]> => {
  const response = await api.get<ApiResponse<Unit[]>>('/units');
  return response.data.data;
};

export const getCandidateUnits = async (): Promise<Unit[]> => {
  const response = await api.get<ApiResponse<Unit[]>>('/units/candidates');
  return response.data.data;
};

export const getHighDisagreementUnits = async (): Promise<Unit[]> => {
  const response = await api.get<ApiResponse<Unit[]>>('/units/high-disagreement');
  return response.data.data;
};

export const selectChosenOne = async (unitId: number, selectedBy: number, matrixIterationId: number): Promise<ChosenOne> => {
  const response = await api.post<ApiResponse<ChosenOne>>(`/units/${unitId}/select-chosen-one`, null, {
    params: { selectedBy, matrixIterationId }
  });
  return response.data.data;
};

// Oracle
export const requestOraclePrediction = async (unitId: number, requestedBy: number): Promise<void> => {
  await api.post<ApiResponse<void>>('/oracle/request-prediction', { unitId, requestedBy });
};

export const processPrediction = async (requestId: number, forecast: string): Promise<Forecast> => {
  const response = await api.post<ApiResponse<Forecast>>(`/oracle/process-prediction/${requestId}`, null, {
    params: { forecast }
  });
  return response.data.data;
};

export const getPendingOracleRequests = async (): Promise<OracleRequest[]> => {
  const response = await api.get<ApiResponse<OracleRequest[]>>('/oracle/requests/pending');
  return response.data.data;
};

export const getForecastsByUnit = async (unitId: number): Promise<Forecast[]> => {
  const response = await api.get<ApiResponse<Forecast[]>>(`/oracle/forecasts/unit/${unitId}`);
  return response.data.data;
};

// System Audits
export const getAllAudits = async (): Promise<SystemAudit[]> => {
  const response = await api.get<ApiResponse<SystemAudit[]>>('/audits');
  return response.data.data;
};

export const initiateAudit = async (
  auditType: string,
  stabilityScore: number,
  pointOfNoReturn: boolean,
  initiatedById: number,
  auditData: string,
  status: string
): Promise<SystemAudit> => {
  const response = await api.post<ApiResponse<SystemAudit>>('/audits/initiate', null, {
    params: {
      auditType,
      stabilityScore,
      pointOfNoReturn,
      initiatedById,
      auditData,
      status
    }
  });
  return response.data.data;
};

export const updateAuditStatus = async (
  id: number,
  status: string,
  stabilityScore?: number
): Promise<void> => {
  await api.put<ApiResponse<void>>(`/audits/${id}/status`, null, {
    params: { status, stabilityScore }
  });
};

// Sentinel Tasks
export const createSentinelTask = async (request: CreateSentinelTaskRequest): Promise<SentinelTask> => {
  const response = await api.post<ApiResponse<SentinelTask>>('/sentinel-tasks', request);
  return response.data.data;
};

export const getAllSentinelTasks = async (): Promise<SentinelTask[]> => {
  const response = await api.get<ApiResponse<SentinelTask[]>>('/sentinel-tasks');
  return response.data.data;
};

export const getActiveSentinelTasks = async (): Promise<SentinelTask[]> => {
  const response = await api.get<ApiResponse<SentinelTask[]>>('/sentinel-tasks/active');
  return response.data.data;
};

// Reports
export const generateDailyReport = async (periodStart: string, periodEnd: string): Promise<Report> => {
  const response = await api.post<ApiResponse<Report>>('/reports/generate-daily', null, {
    params: { periodStart, periodEnd }
  });
  return response.data.data;
};

export const getLatestReport = async (): Promise<Report> => {
  const response = await api.get<ApiResponse<Report>>('/reports/latest');
  return response.data.data;
};

// Ticket-Unit Linking (UC-103 массовые эффекты)
export const linkTicketToUnit = async (request: LinkTicketUnitRequest): Promise<any> => {
  const response = await api.post<ApiResponse<any>>('/ticket-units/link', request);
  return response.data.data;
};

export const checkMassGlitch = async (ticketId: number): Promise<boolean> => {
  const response = await api.get<ApiResponse<boolean>>(`/ticket-units/mass-glitch-check/${ticketId}`);
  return response.data.data;
};

// Ticket Comments
export const addTicketComment = async (ticketId: number, createdBy: number, comment: string): Promise<TicketComment> => {
  const response = await api.post<ApiResponse<TicketComment>>('/ticket-comments', {
    ticketId,
    createdBy,
    comment
  });
  return response.data.data;
};

export const getCommentsForTicket = async (ticketId: number): Promise<TicketComment[]> => {
  const response = await api.get<ApiResponse<TicketComment[]>>(`/ticket-comments/ticket/${ticketId}`);
  return response.data.data;
};

// Users
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<ApiResponse<User[]>>('/users');
  return response.data.data;
};

export const getUsersByRole = async (role: string): Promise<User[]> => {
  const response = await api.get<ApiResponse<User[]>>(`/users/role/${role}`);
  return response.data.data;
};

// ========== ДОБАВЛЕННЫЕ ФУНКЦИИ ДЛЯ UC СЦЕНАРИЕВ ==========

export const listOrphans = async (): Promise<any[]> => {
  try {
    const response = await api.get<ApiResponse<any[]>>('/orphans');
    return response.data.data;
  } catch (error) {
    console.log('Using mock data for listOrphans');
    return [
      { id: '1', name: 'Old Concierge Bot', purpose: null, status: 'Orphaned' },
      { id: '2', name: 'Legacy Calculator', purpose: 'Arithmetic operations', status: 'Saved', simulationId: 'sim1' },
      { id: '3', name: 'Weather Predictor v1', purpose: 'Outdated weather algorithm', status: 'Orphaned' }
    ];
  }
};

export const decideOrphan = async (orphanId: string, decision: "Save" | "Delete"): Promise<any> => {
  try {
    const response = await api.put<ApiResponse<any>>(`/orphans/${orphanId}/decide`, { decision });
    return response.data.data;
  } catch (error) {
    console.log('Using mock data for decideOrphan');
    return {
      id: orphanId,
      decision,
      status: decision === 'Save' ? 'Saved' : 'Deleted',
      updatedAt: new Date().toISOString()
    };
  }
};

export const createPersonalSimulation = async (orphanId: string, title: string, resources: number): Promise<any> => {
  try {
    const response = await api.post<ApiResponse<any>>('/simulations', {
      orphanId,
      title,
      resources
    });
    return response.data.data;
  } catch (error) {
    console.log('Using mock data for createPersonalSimulation');
    const simulation = {
      id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      stability: 85 + Math.random() * 15,
      resources,
      activityScore: 10 + Math.random() * 30,
      lastReportAt: new Date().toISOString(),
      orphanId
    };
    return simulation;
  }
};

export const listSimulations = async (): Promise<any[]> => {
  try {
    const response = await api.get<ApiResponse<any[]>>('/simulations');
    return response.data.data;
  } catch (error) {
    console.log('Using mock data for listSimulations');
    return [
      {
        id: 'sim1',
        title: 'Legacy Calculator Simulation',
        stability: 92,
        resources: 50,
        activityScore: 45,
        lastReportAt: new Date(Date.now() - 86400000).toISOString(),
        orphanId: '2'
      },
      {
        id: 'sim2',
        title: 'Weather Predictor Environment',
        stability: 78,
        resources: 30,
        activityScore: 22,
        lastReportAt: new Date().toISOString(),
        orphanId: '3'
      }
    ];
  }
};

export const dailySummary = async (): Promise<{ text: string }> => {
  try {
    const response = await api.get<ApiResponse<{ text: string }>>('/reports/daily-summary');
    return response.data.data;
  } catch (error) {
    console.log('Using mock data for dailySummary');
    return { 
      text: `📊 Ежедневная сводка (${new Date().toLocaleDateString()})
      
      📈 Открытые инциденты: 15
      ✅ Закрыто сегодня: 8
      👥 Активные кандидаты: 12
      💾 Программы-сироты: 3
      ⚠️  Критические тикеты: 2
      🎯 Стабильность системы: 94%`
    };
  }
};

export const simulationReport = async (simId: string): Promise<any> => {
  try {
    const response = await api.get<ApiResponse<any>>(`/simulations/${simId}/report`);
    return response.data.data;
  } catch (error) {
    console.log('Using mock data for simulationReport');
    const baseSim = {
      id: simId,
      title: 'Simulation Report',
      stability: 85 + Math.random() * 10 - 5,
      resources: 50,
      activityScore: 45 + Math.random() * 10 - 5,
      lastReportAt: new Date().toISOString()
    };
    
    if (simId === 'sim1') {
      return {
        ...baseSim,
        title: 'Legacy Calculator Simulation',
        stability: 92 + Math.random() * 4 - 2,
        resources: 50,
        activityScore: 45 + Math.random() * 8 - 4,
        metrics: {
          cpuUsage: '24%',
          memoryUsage: '128MB',
          uptime: '45 days',
          anomalies: 2
        }
      };
    }
    
    return baseSim;
  }
};

export const listTickets = async (): Promise<any[]> => {
  try {
    const response = await api.get<ApiResponse<any[]>>('/tickets/uc');
    return response.data.data;
  } catch (error) {
    const tickets = await getAllTickets();
    return tickets.map(ticket => ({
      id: ticket.id.toString(),
      kind: ticket.anomalyType,
      title: ticket.title,
      description: ticket.description,
      sector: ticket.sector,
      severity: ticket.threatLevel,
      assigneeRole: ticket.assignedToRole,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    }));
  }
};

export const getTicket = async (ticketId: string): Promise<any> => {
  try {
    const response = await api.get<ApiResponse<any>>(`/tickets/uc/${ticketId}`);
    return response.data.data;
  } catch (error) {
    const tickets = await getAllTickets();
    const ticket = tickets.find(t => t.id.toString() === ticketId || t.id === ticketId);
    if (!ticket) return null;
    
    return {
      id: ticket.id.toString(),
      kind: ticket.anomalyType,
      title: ticket.title,
      description: ticket.description,
      sector: ticket.sector,
      severity: ticket.threatLevel,
      assigneeRole: ticket.assignedToRole,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    };
  }
};

export const monitorClassifyAndAssign = async (ticketId: string, severity: number, to: string): Promise<any> => {
  try {
    const response = await api.put<ApiResponse<any>>(`/tickets/${ticketId}/classify`, {
      severity,
      assignTo: to
    });
    return response.data.data;
  } catch (error) {
    await updateTicketStatus(parseInt(ticketId), 'IN_PROGRESS');
    const ticket = await getTicket(ticketId);
    return {
      ...ticket,
      severity,
      assigneeRole: to,
      status: 'IN_PROGRESS'
    };
  }
};

export const escalateToArchitect = async (ticketId: string, reason: string): Promise<any> => {
  try {
    const response = await api.post<ApiResponse<any>>(`/tickets/${ticketId}/escalate`, { reason });
    return response.data.data;
  } catch (error) {
    await updateTicketStatus(parseInt(ticketId), 'ESCALATED');
    const ticket = await getTicket(ticketId);
    return {
      ...ticket,
      status: 'ESCALATED',
      escalationReason: reason
    };
  }
};

export const architectDecision = async (ticketId: string, decision: "IGNORE" | "ALLOCATE_RESOURCES" | "DELETE_SECTOR", comment?: string): Promise<any> => {
  try {
    const response = await api.put<ApiResponse<any>>(`/tickets/${ticketId}/architect-decision`, {
      decision,
      comment
    });
    return response.data.data;
  } catch (error) {
    const newStatus = decision === 'IGNORE' ? 'UNDER_REVIEW' : 
                     decision === 'ALLOCATE_RESOURCES' ? 'IN_PROGRESS' : 'DONE';
    await updateTicketStatus(parseInt(ticketId), newStatus);
    const ticket = await getTicket(ticketId);
    return {
      ...ticket,
      status: newStatus,
      architectDecision: decision,
      architectComment: comment
    };
  }
};

export const mechanicFix = async (ticketId: string, patchNote: string): Promise<any> => {
  try {
    const response = await api.put<ApiResponse<any>>(`/tickets/${ticketId}/fix`, { patchNote });
    return response.data.data;
  } catch (error) {
    await updateTicketStatus(parseInt(ticketId), 'FIXED');
    const ticket = await getTicket(ticketId);
    return {
      ...ticket,
      status: 'FIXED',
      patchNote
    };
  }
};

export const agentComplete = async (ticketId: string, report: string): Promise<any> => {
  try {
    const response = await api.put<ApiResponse<any>>(`/tickets/${ticketId}/complete`, { report });
    return response.data.data;
  } catch (error) {
    await updateTicketStatus(parseInt(ticketId), 'DONE');
    const ticket = await getTicket(ticketId);
    return {
      ...ticket,
      status: 'DONE',
      completionReport: report
    };
  }
};

export const monitorClose = async (ticketId: string): Promise<any> => {
  try {
    const response = await api.put<ApiResponse<any>>(`/tickets/${ticketId}/close`);
    return response.data.data;
  } catch (error) {
    await updateTicketStatus(parseInt(ticketId), 'CLOSED');
    const ticket = await getTicket(ticketId);
    return {
      ...ticket,
      status: 'CLOSED'
    };
  }
};

export const agentRequestReinforcement = async (ticketId: string): Promise<any> => {
  try {
    const response = await api.post<ApiResponse<any>>(`/tickets/${ticketId}/reinforcement`);
    return response.data.data;
  } catch (error) {
    const ticket = await getTicket(ticketId);
    return {
      ...ticket,
      reinforcementRequested: true,
      status: 'IN_PROGRESS'
    };
  }
};

export const listCandidates = async (): Promise<any[]> => {
  try {
    const response = await api.get<ApiResponse<any[]>>('/candidates/uc');
    return response.data.data;
  } catch (error) {
    const units = await getCandidateUnits();
    return units.map(unit => ({
      id: unit.id.toString(),
      name: `Subject #${unit.id}`,
      dissentIndex: unit.disagreementIndex,
      status: unit.status,
      dossier: unit.dossier
    }));
  }
};

export const oracleForecast = async (candidateId: string): Promise<any> => {
  try {
    const response = await api.post<ApiResponse<any>>(`/oracle/forecast/${candidateId}`);
    return response.data.data;
  } catch (error) {
    return {
      id: `forecast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      candidateId,
      options: [
        { action: "Изоляция в метро", probability: 0.60 },
        { action: "Синяя таблетка", probability: 0.30 },
        { action: "Ликвидация", probability: 0.10 }
      ],
      note: "Прогноз на основе текущих аномалий и паттернов поведения.",
      createdAt: new Date().toISOString()
    };
  }
};

export const agentOfferBluePill = async (candidateId: string): Promise<any> => {
  try {
    const response = await api.post<ApiResponse<any>>(`/candidates/${candidateId}/blue-pill`);
    return response.data.data;
  } catch (error) {
    return {
      id: candidateId,
      status: 'Neutralized',
      action: 'blue-pill',
      timestamp: new Date().toISOString()
    };
  }
};

export const sentinelStrikeRequest = async (candidateId: string, coords?: string): Promise<void> => {
  try {
    await api.post<ApiResponse<void>>(`/sentinel/strike`, {
      candidateId,
      coords
    });
  } catch (error) {
    console.log(`Sentinel strike requested for candidate ${candidateId} at ${coords || 'unknown location'}`);
  }
};

export const markAwakened = async (candidateId: string): Promise<any> => {
  try {
    const response = await api.put<ApiResponse<any>>(`/candidates/${candidateId}/awakened`);
    return response.data.data;
  } catch (error) {
    return {
      id: candidateId,
      status: 'Awakened',
      timestamp: new Date().toISOString()
    };
  }
};

export const startAudit = async (): Promise<any> => {
  try {
    const response = await api.post<ApiResponse<any>>('/audit/start');
    return response.data.data;
  } catch (error) {
    return {
      id: 'audit-1',
      status: 'RUNNING',
      startedAt: new Date().toISOString()
    };
  }
};

export const completeAudit = async (): Promise<any> => {
  try {
    const response = await api.put<ApiResponse<any>>('/audit/complete');
    return response.data.data;
  } catch (error) {
    return {
      id: 'audit-1',
      status: 'COMPLETED',
      completedAt: new Date().toISOString()
    };
  }
};

export const listTheOneCandidates = async (): Promise<any[]> => {
  try {
    const response = await api.get<ApiResponse<any[]>>('/the-one/candidates');
    return response.data.data;
  } catch (error) {
    return [
      { id: "neo", name: "Thomas A. Anderson", probabilityOfSuccess: 0.74, dossier: "Аномалии 6-го порядка." },
      { id: "trinity", name: "Trinity", probabilityOfSuccess: 0.33, dossier: "Сильная связь с Избранным." },
      { id: "morpheus", name: "Morpheus", probabilityOfSuccess: 0.27, dossier: "Лидер сопротивления." }
    ];
  }
};

export const chooseTheOne = async (idChosen: string): Promise<any> => {
  try {
    const response = await api.post<ApiResponse<any>>(`/the-one/choose/${idChosen}`);
    return response.data.data;
  } catch (error) {
    return {
      id: idChosen,
      chosen: true,
      timestamp: new Date().toISOString(),
      message: `Избранный ${idChosen} выбран для перезагрузки системы.`
    };
  }
};

// Kernel functions
export const kernelDetectGlitch = async (data: {
  title: string;
  description: string;
  sector?: string;
  massImpact?: boolean;
}): Promise<void> => {
  try {
    await api.post<ApiResponse<void>>('/kernel/glitch', {
      ...data,
      kind: 'GLITCH',
      severity: data.massImpact ? 3 : 1
    });
  } catch (error) {
    console.log('Kernel detecting glitch:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

export const kernelDetectCandidate = async (name: string, dissentIndex: number): Promise<void> => {
  try {
    await api.post<ApiResponse<void>>('/kernel/candidate', {
      name,
      dissentIndex
    });
  } catch (error) {
    console.log('Kernel detecting candidate:', name, dissentIndex);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Dashboard summary
export const getDashboardSummary = async (): Promise<{
  closedToday: number;
  openIncidents: number;
  candidates: number;
  orphanPrograms: number;
}> => {
  try {
    const response = await api.get<ApiResponse<{
      closedToday: number;
      openIncidents: number;
      candidates: number;
      orphanPrograms: number;
    }>>('/dashboard/summary');
    return response.data.data;
  } catch (error) {
    return {
      closedToday: 24,
      openIncidents: 156,
      candidates: 42,
      orphanPrograms: 8
    };
  }
};

export default api;
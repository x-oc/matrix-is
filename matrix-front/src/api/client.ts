import axios from 'axios';
import type {
  Ticket, Unit, OracleRequest, Forecast, SystemAudit,
  SentinelTask, Report, ChosenOne, CreateTicketRequest,
  AuthResponse, ApiResponse, DashboardSummaryResponse,
  OraclePredictionResponse, User, TicketComment
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

// ========== AUTH ==========
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

// ========== DASHBOARD ==========
export const getDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
  const response = await api.get<ApiResponse<DashboardSummaryResponse>>('/dashboard/summary');
  return response.data.data;
};

export const getTicketStatusStatistics = async (): Promise<any> => {
  const response = await api.get<ApiResponse<any>>('/dashboard/tickets/status');
  return response.data.data;
};

export const getCandidateStatistics = async (): Promise<any> => {
  const response = await api.get<ApiResponse<any>>('/dashboard/candidates/stats');
  return response.data.data;
};

export const getSystemHealthMetrics = async (): Promise<any> => {
  const response = await api.get<ApiResponse<any>>('/dashboard/system/health');
  return response.data.data;
};

// ========== TICKETS ==========
export const getAllTickets = async (): Promise<Ticket[]> => {
  const response = await api.get<ApiResponse<Ticket[]>>('/tickets');
  return response.data.data;
};

export const createTicket = async (request: CreateTicketRequest): Promise<Ticket> => {
  const response = await api.post<ApiResponse<Ticket>>('/tickets', request);
  return response.data.data;
};

export const getTicketsByStatus = async (status: string): Promise<Ticket[]> => {
  const response = await api.get<ApiResponse<Ticket[]>>(`/tickets/status/${status}`);
  return response.data.data;
};

export const getTicketsByRoleAndStatus = async (role: string, status: string): Promise<Ticket[]> => {
  const response = await api.get<ApiResponse<Ticket[]>>(`/tickets/role/${role}/status/${status}`);
  return response.data.data;
};

export const assignTicket = async (id: number, role: string): Promise<Ticket> => {
  const response = await api.put<ApiResponse<Ticket>>(`/tickets/${id}/assign`, null, {
    params: { role }
  });
  return response.data.data;
};

export const updateTicketStatus = async (id: number, status: string): Promise<void> => {
  await api.put<ApiResponse<void>>(`/tickets/${id}/status/${status}`);
};

export const escalateMassGlitch = async (id: number): Promise<void> => {
  await api.post<ApiResponse<void>>(`/tickets/${id}/escalate-mass-glitch`);
};

// ========== TICKET COMMENTS ==========
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

// ========== TICKET WORKFLOW ==========
export const startWork = async (ticketId: number, userId: number): Promise<void> => {
  await api.put<ApiResponse<void>>(`/ticket-workflow/${ticketId}/start-work`, null, {
    params: { userId }
  });
};

export const submitForReview = async (ticketId: number, userId: number): Promise<void> => {
  await api.put<ApiResponse<void>>(`/ticket-workflow/${ticketId}/submit-for-review`, null, {
    params: { userId }
  });
};

export const closeTicket = async (ticketId: number, userId: number): Promise<void> => {
  await api.put<ApiResponse<void>>(`/ticket-workflow/${ticketId}/close`, null, {
    params: { userId }
  });
};

export const getAssignedToMechanic = async (): Promise<Ticket[]> => {
  const response = await api.get<ApiResponse<Ticket[]>>('/ticket-workflow/mechanic/assigned');
  return response.data.data;
};

export const getAssignedToAgentSmith = async (): Promise<Ticket[]> => {
  const response = await api.get<ApiResponse<Ticket[]>>('/ticket-workflow/agent-smith/assigned');
  return response.data.data;
};

// ========== UNITS ==========
export const getAllUnits = async (): Promise<Unit[]> => {
  const response = await api.get<ApiResponse<Unit[]>>('/units');
  return response.data.data;
};

export const getUnitById = async (id: number): Promise<Unit> => {
  const response = await api.get<ApiResponse<Unit>>(`/units/${id}`);
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

// ========== ORACLE ==========
export const requestOraclePrediction = async (unitId: number, requestedBy: number, additionalContext?: string): Promise<OracleRequest> => {
  const response = await api.post<ApiResponse<OracleRequest>>('/oracle/request-prediction', {
    unitId,
    requestedBy,
    additionalContext
  });
  return response.data.data;
};

export const processPrediction = async (requestId: number): Promise<OraclePredictionResponse> => {
  const response = await api.post<ApiResponse<OraclePredictionResponse>>(`/oracle/process-prediction/${requestId}`);
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

export const getLatestPredictionForUnit = async (unitId: number): Promise<OraclePredictionResponse | null> => {
  const response = await api.get<ApiResponse<OraclePredictionResponse>>(`/oracle/predictions/unit/${unitId}/latest`);
  return response.data.data;
};

// ========== SYSTEM AUDITS ==========
export const getAllAudits = async (): Promise<SystemAudit[]> => {
  const response = await api.get<ApiResponse<SystemAudit[]>>('/system-audits');
  return response.data.data;
};

export const initiateAudit = async (initiatedById: number): Promise<SystemAudit> => {
  const response = await api.post<ApiResponse<SystemAudit>>('/system-audits/initiate', null, {
    params: { initiatedById }
  });
  return response.data.data;
};

export const performAudit = async (auditId: number): Promise<any> => {
  const response = await api.post<ApiResponse<any>>(`/system-audits/${auditId}/perform`);
  return response.data.data;
};

export const getPointOfNoReturnAnalysis = async (auditId: number): Promise<string> => {
  const response = await api.get<ApiResponse<string>>(`/system-audits/${auditId}/point-of-no-return`);
  return response.data.data;
};

export const recommendChosenOneBasedOnAudit = async (auditId: number): Promise<void> => {
  await api.post<ApiResponse<void>>(`/system-audits/${auditId}/recommend-chosen-one`);
};

// ========== SENTINEL TASKS ==========
export const createSentinelTask = async (
  createdBy: number,
  status: string,
  sentinelCount: number,
  locationId: number,
  description?: string
): Promise<SentinelTask> => {
  const response = await api.post<ApiResponse<SentinelTask>>('/sentinel-tasks', {
    createdBy,
    status,
    sentinelCount,
    locationId,
    description
  });
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

export const getSentinelTasksByStatus = async (status: string): Promise<SentinelTask[]> => {
  const response = await api.get<ApiResponse<SentinelTask[]>>(`/sentinel-tasks/status/${status}`);
  return response.data.data;
};

export const updateSentinelTaskStatus = async (id: number, status: string): Promise<SentinelTask> => {
  const response = await api.put<ApiResponse<SentinelTask>>(`/sentinel-tasks/${id}/status`, null, {
    params: { status }
  });
  return response.data.data;
};

// ========== SENTINEL STRIKE ==========
export const requestSentinelStrike = async (
  targetCoordinates: string,
  sentinelCount: number,
  priority: string,
  requestedById: number
): Promise<void> => {
  await api.post<ApiResponse<void>>('/sentinels/strike', {
    targetCoordinates,
    sentinelCount,
    priority,
    requestedById
  });
};

export const getSentinelStrikeStatus = async (requestId: number): Promise<any> => {
  const response = await api.get<ApiResponse<any>>(`/sentinels/strike/status/${requestId}`);
  return response.data.data;
};

export const executeSentinelStrike = async (requestId: number): Promise<void> => {
  await api.post<ApiResponse<void>>(`/sentinels/strike/${requestId}/execute`);
};

// ========== REPORTS ==========
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

export const getArchitectReport = async (): Promise<any> => {
  const response = await api.get<ApiResponse<any>>('/reports/for-architect');
  return response.data.data;
};

// ========== USERS ==========
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<ApiResponse<User[]>>('/users');
  return response.data.data;
};

export const getActiveUsers = async (): Promise<User[]> => {
  const response = await api.get<ApiResponse<User[]>>('/users/active');
  return response.data.data;
};

export const getUsersByRole = async (role: string): Promise<User[]> => {
  const response = await api.get<ApiResponse<User[]>>(`/users/role/${role}`);
  return response.data.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get<ApiResponse<User>>(`/users/${id}`);
  return response.data.data;
};

export const updateUserStatus = async (id: number, isActive: boolean): Promise<User> => {
  const response = await api.put<ApiResponse<User>>(`/users/${id}/status`, null, {
    params: { isActive }
  });
  return response.data.data;
};

// ========== SYSTEM KERNEL ==========
export const createGlitchTicket = async (request: any): Promise<Ticket> => {
  const response = await api.post<ApiResponse<Ticket>>('/kernel/glitch', request);
  return response.data.data;
};

export const autoDetectAndCreateTickets = async (): Promise<void> => {
  await api.post<ApiResponse<void>>('/kernel/candidate');
};

export const escalateToHighPriority = async (ticketId: number, affectedUnits: number): Promise<void> => {
  await api.post<ApiResponse<void>>(`/kernel/escalate/${ticketId}`, null, {
    params: { affectedUnits }
  });
};

// ========== TICKET-UNIT LINKING ==========
export const linkTicketToUnit = async (ticketId: number, unitId: number, status: string): Promise<any> => {
  const response = await api.post<ApiResponse<any>>('/ticket-units/link', {
    ticketId,
    unitId,
    status
  });
  return response.data.data;
};

export const getTicketUnitsByTicket = async (ticketId: number): Promise<any[]> => {
  const response = await api.get<ApiResponse<any[]>>(`/ticket-units/ticket/${ticketId}`);
  return response.data.data;
};

export const getTicketUnitsByUnit = async (unitId: number): Promise<any[]> => {
  const response = await api.get<ApiResponse<any[]>>(`/ticket-units/unit/${unitId}`);
  return response.data.data;
};

export const updateTicketUnitStatus = async (id: number, status: string): Promise<any> => {
  const response = await api.put<ApiResponse<any>>(`/ticket-units/${id}/status`, null, {
    params: { status }
  });
  return response.data.data;
};

export const checkMassGlitch = async (ticketId: number): Promise<boolean> => {
  const response = await api.get<ApiResponse<boolean>>(`/ticket-units/mass-glitch-check/${ticketId}`);
  return response.data.data;
};

// ========== CHOSEN ONE ==========
export const getCurrentChosenOne = async (): Promise<ChosenOne> => {
  const response = await api.get<ApiResponse<ChosenOne>>('/chosen-ones/current');
  return response.data.data;
};

export const liftRestrictions = async (id: number): Promise<ChosenOne> => {
  const response = await api.put<ApiResponse<ChosenOne>>(`/chosen-ones/${id}/lift-restrictions`);
  return response.data.data;
};

export const conductFinalInterview = async (id: number, decision: string): Promise<string> => {
  const response = await api.post<ApiResponse<string>>(`/chosen-ones/${id}/final-interview`, null, {
    params: { decision }
  });
  return response.data.data;
};

export const getChosenOnesByIteration = async (iterationId: number): Promise<ChosenOne[]> => {
  const response = await api.get<ApiResponse<ChosenOne[]>>(`/chosen-ones/iteration/${iterationId}`);
  return response.data.data;
};

// ========== MATRIX ITERATIONS ==========
export const getAllMatrixIterations = async (): Promise<any[]> => {
  const response = await api.get<ApiResponse<any[]>>('/matrix-iterations');
  return response.data.data;
};

export const getCurrentIteration = async (): Promise<any> => {
  const response = await api.get<ApiResponse<any>>('/matrix-iterations/current');
  return response.data.data;
};

export const createMatrixIteration = async (num: number, description: string): Promise<any> => {
  const response = await api.post<ApiResponse<any>>('/matrix-iterations', null, {
    params: { num, description }
  });
  return response.data.data;
};

// ========== ROLE PERMISSIONS ==========
export const getPermissionsByRole = async (role: string): Promise<string[]> => {
  const response = await api.get<ApiResponse<string[]>>(`/role-permissions/role/${role}`);
  return response.data.data;
};

export const grantPermission = async (role: string, permission: string): Promise<any> => {
  const response = await api.post<ApiResponse<any>>('/role-permissions/grant', null, {
    params: { role, permission }
  });
  return response.data.data;
};

export const revokePermission = async (role: string, permission: string): Promise<void> => {
  await api.delete<ApiResponse<void>>('/role-permissions/revoke', {
    params: { role, permission }
  });
};

export const checkPermission = async (role: string, permission: string): Promise<boolean> => {
  const response = await api.get<ApiResponse<boolean>>('/role-permissions/check', {
    params: { role, permission }
  });
  return response.data.data;
};

// ========== SECTORS ==========
export const getAllSectors = async (): Promise<any[]> => {
  const response = await api.get<ApiResponse<any[]>>('/sectors');
  return response.data.data;
};

export const getSectorById = async (id: number): Promise<any> => {
  const response = await api.get<ApiResponse<any>>(`/sectors/${id}`);
  return response.data.data;
};

export const getSectorByCode = async (code: string): Promise<any> => {
  const response = await api.get<ApiResponse<any>>(`/sectors/code/${code}`);
  return response.data.data;
};

export const createSector = async (code: string): Promise<any> => {
  const response = await api.post<ApiResponse<any>>('/sectors', null, {
    params: { code }
  });
  return response.data.data;
};

// ========== MESSAGES ==========
export const sendMessage = async (fromUserId: number, toUserId: number, text: string): Promise<any> => {
  const response = await api.post<ApiResponse<any>>('/messages', {
    fromUserId,
    toUserId,
    text
  });
  return response.data.data;
};

export const getMessagesForUser = async (userId: number): Promise<any[]> => {
  const response = await api.get<ApiResponse<any[]>>(`/messages/user/${userId}`);
  return response.data.data;
};

export const getSentMessages = async (userId: number): Promise<any[]> => {
  const response = await api.get<ApiResponse<any[]>>(`/messages/sent/${userId}`);
  return response.data.data;
};

// ========== MECHANIC PERMISSIONS ==========
export const createMechanicPermission = async (userId: number, sectorId: number, permissionStart: string, permissionEnd: string): Promise<any> => {
  const response = await api.post<ApiResponse<any>>('/mechanic-permissions', {
    userId,
    sectorId,
    permissionStart,
    permissionEnd
  });
  return response.data.data;
};

export const getMechanicPermissionsByUser = async (userId: number): Promise<any[]> => {
  const response = await api.get<ApiResponse<any[]>>(`/mechanic-permissions/user/${userId}`);
  return response.data.data;
};

export const getMechanicPermissionsBySector = async (sectorId: number): Promise<any[]> => {
  const response = await api.get<ApiResponse<any[]>>(`/mechanic-permissions/sector/${sectorId}`);
  return response.data.data;
};

export const revokeMechanicPermission = async (id: number): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/mechanic-permissions/${id}`);
};

// ========== CANDIDATES ==========
export const detectCandidates = async (): Promise<void> => {
  await api.post<ApiResponse<void>>('/candidates/detect');
};

export const requestOraclePredictionForCandidate = async (unitId: number, requestedById: number): Promise<void> => {
  await api.post<ApiResponse<void>>(`/candidates/${unitId}/request-oracle`, null, {
    params: { requestedById }
  });
};

export default api;
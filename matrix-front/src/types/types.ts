// ==================== БАЗОВЫЕ ТИПЫ ====================

export type Role =
  | "ARCHITECT"
  | "KERNEL"
  | "MONITOR"
  | "AGENT_SMITH"
  | "ORACLE"
  | "KEYMAKER"
  | "SENTINEL_CTRL"
  | "MECHANIC";

export type Severity = 1 | 2 | 3;

export type TicketStatus =
  | "NEW" | "ASSIGNED_MONITOR" | "IN_PROGRESS" | "FIXED"
  | "DONE" | "UNDER_REVIEW" | "ESCALATED" | "AWAITING_DECISION" | "CLOSED";

export interface Ticket {
  id: string;
  kind: "GLITCH" | "PARADOX" | "ORPHAN" | "OTHER";
  title: string;
  description: string;
  sector?: string;
  severity: Severity;
  assigneeRole?: Role;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  relatedCandidateId?: string;
}

export type CandidateStatus = "Candidate" | "Awakened" | "Neutralized" | "InProcessing";

export interface Candidate {
  id: string;
  name: string;
  dissentIndex: number; // 0..10
  status: CandidateStatus;
  dossier: string;
  lastForecastId?: string;
}

export interface ForecastOption {
  action: string;          // "Isolate in metro", "Offer blue pill" etc.
  probability: number;     // 0..1
}

export interface Forecast {
  id: string;
  candidateId: string;
  options: ForecastOption[];
  createdAt: string;
  note?: string;
}

export interface OrphanProgram {
  id: string;
  name: string;
  purpose?: string | null;
  status: "Orphaned" | "Saved" | "Deleted";
  simulationId?: string;
}

export interface Simulation {
  id: string;
  title: string;
  stability: number;     // 0..100
  resources: number;     // условные единицы
  activityScore: number; // 0..100
  lastReportAt: string;
  orphanId?: string;
}

export interface Audit {
  id: string;
  status: "IDLE" | "RUNNING" | "COMPLETED";
  startedAt?: string;
  completedAt?: string;
}

export interface TheOneCandidate {
  id: string;
  name: string;
  probabilityOfSuccess: number; // 0..1
  dossier: string;
}

export interface AppSummary {
  closedToday: number;
  openIncidents: number;
  candidates: number;
  orphanPrograms: number;
}

// ==================== ENUM ДЛЯ УДОБСТВА ====================

export const RoleEnum = {
  ARCHITECT: "ARCHITECT" as Role,
  KERNEL: "KERNEL" as Role,
  MONITOR: "MONITOR" as Role,
  AGENT_SMITH: "AGENT_SMITH" as Role,
  ORACLE: "ORACLE" as Role,
  KEYMAKER: "KEYMAKER" as Role,
  SENTINEL_CTRL: "SENTINEL_CTRL" as Role,
  MECHANIC: "MECHANIC" as Role
};

export const TicketStatusEnum = {
  NEW: "NEW",
  ASSIGNED_MONITOR: "ASSIGNED_MONITOR",
  IN_PROGRESS: "IN_PROGRESS",
  FIXED: "FIXED",
  DONE: "DONE",
  UNDER_REVIEW: "UNDER_REVIEW",
  ESCALATED: "ESCALATED",
  AWAITING_DECISION: "AWAITING_DECISION",
  CLOSED: "CLOSED"
} as const;

export type TicketStatusEnum = typeof TicketStatusEnum[keyof typeof TicketStatusEnum];

export const UnitStatusEnum = {
  CANDIDATE: "Candidate",
  AWAKENED: "Awakened",
  NEUTRALIZED: "Neutralized",
  IN_PROCESSING: "InProcessing"
} as const;

export type UnitStatusEnum = typeof UnitStatusEnum[keyof typeof UnitStatusEnum];

export const AnomalyTypeEnum = {
  GLITCH: "GLITCH",
  PARADOX: "PARADOX",
  ORPHAN: "ORPHAN",
  OTHER: "OTHER"
} as const;

export type AnomalyTypeEnum = typeof AnomalyTypeEnum[keyof typeof AnomalyTypeEnum];

export const TicketImportanceEnum = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
} as const;

export type TicketImportanceEnum = typeof TicketImportanceEnum[keyof typeof TicketImportanceEnum];

// ==================== ТИПЫ ДЛЯ API ====================

export interface ApiUser {
  id: number;
  username: string;
  role: Role;
}

export interface ApiUnit {
  id: number;
  status: UnitStatusEnum;
  disagreementIndex: number;
  dossier: string;
  oracleRequests: OracleRequest[];
}

export interface SystemAudit {
  id: number;
  auditType: string;
  status: string;
  stabilityScore: number;
  pointOfNoReturn: boolean;
  initiatedById: number;
  auditData: string;
}

export interface OracleRequest {
  id: number;
  unitId: number;
  requestedById: number;
  status: string;
  createdAt: string;
}

export interface ApiTicket {
  id: number;
  title: string;
  description: string;
  anomalyType: AnomalyTypeEnum;
  threatLevel: TicketImportanceEnum;
  status: TicketStatusEnum;
  assignedToRole?: Role;
  sector?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SentinelTask {
  id: number;
  unitId: number;
  taskType: string;
  status: string;
  requestedById: number;
}

export interface Report {
  id: number;
  reportType: string;
  periodStart: string;
  periodEnd: string;
  data: string;
  generatedAt: string;
}

export interface ChosenOne {
  id: number;
  unitId: number;
  selectedById: number;
  matrixIterationId: number;
  selectedAt: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  anomalyType: AnomalyTypeEnum;
  threatLevel: TicketImportanceEnum;
  sector?: string;
}

export interface CreateSentinelTaskRequest {
  unitId: number;
  taskType: string;
  requestedById: number;
}

export interface LinkTicketUnitRequest {
  ticketId: number;
  unitId: number;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  role: Role;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  createdById: number;
  comment: string;
  createdAt: string;
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ТИПЫ ====================

// Тип для отображения ролей в интерфейсе
export interface RoleDisplay {
  value: Role;
  label: string;
  description: string;
  icon?: string;
}

// Тип для уведомлений
export interface Notification {
  id: string;
  type: "warning" | "error" | "info" | "success";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Тип для статистики дашборда
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  highPriorityTickets: number;
  totalCandidates: number;
  awakenedCandidates: number;
  totalOrphans: number;
  systemStability: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

// Тип для навигационного меню
export interface NavItem {
  path: string;
  label: string;
  roles: Role[];
  icon?: React.ReactNode;
  children?: NavItem[];
}

// Тип для формы логина
export interface LoginFormData {
  username: string;
  password: string;
  role: Role;
}

// Тип для фильтров
export interface TicketFilter {
  status?: TicketStatusEnum[];
  severity?: Severity[];
  assigneeRole?: Role[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface CandidateFilter {
  status?: CandidateStatus[];
  dissentRange?: {
    min: number;
    max: number;
  };
}

// Тип для пагинации
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

// Тип для ответа с пагинацией
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Тип для контекста темы
export interface ThemeContextType {
  mode: "light" | "dark" | "matrix";
  toggleTheme: () => void;
  setTheme: (mode: "light" | "dark" | "matrix") => void;
}

// Тип для контекста уведомлений
export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

// Тип для формы создания тикета
export interface CreateTicketFormData {
  title: string;
  description: string;
  severity: Severity;
  sector?: string;
  kind: "GLITCH" | "PARADOX" | "ORPHAN" | "OTHER";
  massImpact?: boolean;
}

// Тип для формы создания кандидата
export interface CreateCandidateFormData {
  name: string;
  dissentIndex: number;
  dossier: string;
  status: CandidateStatus;
}

// Тип для формы решения по сироте
export interface OrphanDecisionFormData {
  orphanId: string;
  decision: "Save" | "Delete";
  simulationTitle?: string;
  simulationResources?: number;
}

// Тип для формы аудита
export interface AuditFormData {
  auditType: string;
  stabilityScore: number;
  pointOfNoReturn: boolean;
  auditData: string;
}

// Тип для конфигурации компонентов
export interface ComponentConfig {
  showMatrixBackground: boolean;
  enableAnimations: boolean;
  autoRefreshInterval: number;
  theme: "light" | "dark" | "matrix";
}

// УДАЛИТЕ ЭТУ ЧАСТЬ - она вызывает ошибку в runtime
// /*
// Экспорт всех типов по умолчанию
// export default {
//   // Базовые типы
//   Role,
//   Severity,
//   TicketStatus,
//   Ticket,
//   CandidateStatus,
//   Candidate,
//   ForecastOption,
//   Forecast,
//   OrphanProgram,
//   Simulation,
//   Audit,
//   TheOneCandidate,
//   AppSummary,
  
//   // Enum
//   RoleEnum,
//   TicketStatusEnum,
//   UnitStatusEnum,
//   AnomalyTypeEnum,
//   TicketImportanceEnum,
  
//   // API типы
//   ApiUser,
//   ApiUnit,
//   SystemAudit,
//   OracleRequest,
//   ApiTicket,
//   SentinelTask,
//   Report,
//   ChosenOne,
//   CreateTicketRequest,
//   CreateSentinelTaskRequest,
//   LinkTicketUnitRequest,
//   AuthResponse,
//   ApiResponse,
//   TicketComment,
  
//   // Вспомогательные типы
//   RoleDisplay,
//   Notification,
//   DashboardStats,
//   NavItem,
//   LoginFormData,
//   TicketFilter,
//   CandidateFilter,
//   PaginationParams,
//   PaginatedResponse,
//   ThemeContextType,
//   NotificationContextType,
//   CreateTicketFormData,
//   CreateCandidateFormData,
//   OrphanDecisionFormData,
//   AuditFormData,
//   ComponentConfig
// };
// */
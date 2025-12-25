// Базовые типы
export type Role =
  | "ARCHITECT"
  | "SYSTEM_KERNEL"
  | "AGENT_SMITH"
  | "ORACLE"
  | "KEYMAKER"
  | "MONITOR"
  | "SENTINEL_CONTROLLER"
  | "MECHANIC";

export type Severity = 1 | 2 | 3;

export type TicketStatus = "NEW" | "IN_PROGRESS" | "UNDER_REVIEW" | "CLOSED" | "ESCALATED";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  threatLevel: number;
  importanceLevel: "LOW" | "MEDIUM" | "HIGH";
  assignedToRole: Role;
  anomalyType: string;
  matrixCoordinates: string;
  createdAt: string;
  updatedAt: string;
  status: TicketStatus;
}

export type UnitStatus = "NORMAL" | "CANDIDATE" | "AWAKENED" | "SUSPICIOUS" | "THE_ONE";

export interface Unit {
  id: number;
  disagreementIndex: number;
  status: UnitStatus;
  dossier: string;
  statusUpdateAt: string;
  realLocation?: {
    id: number;
    latitude: number;
    longitude: number;
    z?: number;
  };
}

export interface OracleRequest {
  id: number;
  unit: Unit;
  matrixIterationId: number;
  status: string;
  requestedBy: number;
  processedAt?: string;
  createdAt: string;
  forecast?: {
    id: number;
    forecast: string;
    createdAt: string;
  };
}

export interface Forecast {
  id: number;
  forecast: string;
  createdAt: string;
}

export interface SystemAudit {
  id: number;
  auditType: string;
  stabilityScore: number;
  pointOfNoReturn: boolean;
  initiatedBy: number;
  auditData: string;
  createdAt: string;
  status: string;
}

export interface SentinelTask {
  id: number;
  createdBy: number;
  status: string;
  createdAt: string;
  sentinelCount: number;
  location: {
    id: number;
    latitude: number;
    longitude: number;
    z?: number;
  };
  description?: string;
}

export interface Report {
  id: number;
  periodStart: string;
  periodEnd: string;
  generatedData: string;
  createdAt: string;
}

export interface ChosenOne {
  id: number;
  unitId: number;
  restrictionsLifted: boolean;
  finalDecision?: string;
  selectedBy: number;
  userId: number;
  matrixIterationId: number;
  selectedAt: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: Role;
  createdAt: string;
  isActive: boolean;
}

// DTO для запросов
export interface CreateTicketRequest {
  title: string;
  description: string;
  threatLevel: number;
  anomalyType: string;
  matrixCoordinates: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  role: Role;
  expiresAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: number;
}

export interface DashboardSummaryResponse {
  totalTickets: number;
  openTickets: number;
  highPriorityTickets: number;
  totalCandidates: number;
  awakenedUnits: number;
  activeUsers: number;
  generatedAt: string;
}

export interface OraclePredictionResponse {
  requestId: number;
  unitId: number;
  unitName: string;
  prediction: string;
  actionProbabilities: Record<string, number>;
  successRate: number;
  recommendedAction: string;
  createdAt: string;
}

// ENUM константы
export const RoleEnum = {
  ARCHITECT: "ARCHITECT" as Role,
  SYSTEM_KERNEL: "SYSTEM_KERNEL" as Role,
  MONITOR: "MONITOR" as Role,
  AGENT_SMITH: "AGENT_SMITH" as Role,
  ORACLE: "ORACLE" as Role,
  KEYMAKER: "KEYMAKER" as Role,
  SENTINEL_CONTROLLER: "SENTINEL_CONTROLLER" as Role,
  MECHANIC: "MECHANIC" as Role,
};

export const TicketStatusEnum = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  UNDER_REVIEW: "UNDER_REVIEW",
  CLOSED: "CLOSED",
  ESCALATED: "ESCALATED",
} as const;

export const UnitStatusEnum = {
  NORMAL: "NORMAL",
  CANDIDATE: "CANDIDATE",
  AWAKENED: "AWAKENED",
  SUSPICIOUS: "SUSPICIOUS",
  THE_ONE: "THE_ONE",
} as const;

export const AnomalyTypeEnum = {
  PHYSICS_GLITCH: "PHYSICS_GLITCH",
  VISUAL_ARTIFACT: "VISUAL_ARTIFACT",
  TIME_PARADOX: "TIME_PARADOX",
  NPC_MEMORY_ANOMALY: "NPC_MEMORY_ANOMALY",
  SIMULATION_LOGIC_FAILURE: "SIMULATION_LOGIC_FAILURE",
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
  UNIT_AWAKENING: "UNIT_AWAKENING",
  MASS_GLITCH: "MASS_GLITCH",
} as const;

export const TicketImportanceEnum = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export interface TicketComment {
  id: number;
  createdBy: number;
  ticketId: number;
  comment: string;
  createdAt: string;
}
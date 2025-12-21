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

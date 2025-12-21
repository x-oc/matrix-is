import {
  Ticket, Severity, Role, Candidate, Forecast, OrphanProgram, Simulation,
  Audit, TheOneCandidate, AppSummary
} from "../types";

const delay = (ms=400) => new Promise(res => setTimeout(res, ms));
const nowISO = () => new Date().toISOString();
const id = () => Math.random().toString(36).slice(2, 10);

// ---- In-memory state ----
let tickets: Ticket[] = [];
let candidates: Candidate[] = [];
let forecasts: Forecast[] = [];
let orphans: OrphanProgram[] = [];
let sims: Simulation[] = [];
let audit: Audit = { id: "audit-1", status: "IDLE" };
let theOnePool: TheOneCandidate[] = [
  { id: "neo", name: "Thomas A. Anderson", probabilityOfSuccess: 0.74, dossier: "Аномалии 6-го порядка." },
  { id: "trinity", name: "Trinity", probabilityOfSuccess: 0.33, dossier: "Сильная связь с Избранным." },
  { id: "morpheus", name: "Morpheus", probabilityOfSuccess: 0.27, dossier: "Лидер сопротивления." }
];

// ---- Seed demo data ----
(function seed() {
  tickets = [
    {
      id: id(), kind: "GLITCH", title: "Летающая чашка", description: "Нарушение гравитации",
      sector: "S-12", severity: 1, assigneeRole: "MONITOR", status: "ASSIGNED_MONITOR",
      createdAt: nowISO(), updatedAt: nowISO()
    },
    {
      id: id(), kind: "PARADOX", title: "Причинностный парадокс", description: "Свидетели видели себя в прошлом",
      sector: "S-03", severity: 3, assigneeRole: "AGENT_SMITH", status: "IN_PROGRESS",
      createdAt: nowISO(), updatedAt: nowISO()
    }
  ];
  candidates = [
    { id: id(), name: "Subject AAX-112", dissentIndex: 8.7, status: "Candidate", dossier: "Замечен в метро." },
    { id: id(), name: "Subject BBF-005", dissentIndex: 9.6, status: "Candidate", dossier: "Аномальные сны." }
  ];
  orphans = [
    { id: id(), name: "Old Concierge Bot", purpose: null, status: "Orphaned" }
  ];
  sims = [];
})();

// ---- Summary ----
export async function getSummary(): Promise<AppSummary> {
  await delay();
  return {
    closedToday: tickets.filter(t => t.status === "CLOSED").length,
    openIncidents: tickets.filter(t => !["CLOSED","DONE"].includes(t.status)).length,
    candidates: candidates.length,
    orphanPrograms: orphans.filter(o => o.status !== "Deleted").length
  };
}

// ---- UC-101: Kernel creates glitch ticket ----
export async function kernelDetectGlitch(input: {
  title: string; description: string; sector?: string; massImpact?: boolean;
}): Promise<Ticket> {
  await delay();
  const severity: Severity = input.massImpact ? 3 : 1;
  const t: Ticket = {
    id: id(),
    kind: "GLITCH",
    title: input.title,
    description: input.description,
    sector: input.sector,
    severity,
    assigneeRole: "MONITOR",
    status: "ASSIGNED_MONITOR",
    createdAt: nowISO(),
    updatedAt: nowISO()
  };
  tickets.unshift(t);
  return t;
}

// ---- Tickets (UC-102..107, 104, 205) ----
export async function listTickets(): Promise<Ticket[]> {
  await delay();
  return [...tickets];
}

export async function getTicket(ticketId: string): Promise<Ticket> {
  await delay();
  const t = tickets.find(x => x.id === ticketId);
  if (!t) throw new Error("Ticket not found");
  return { ...t };
}

export async function monitorClassifyAndAssign(ticketId: string, severity: Severity, to: Role): Promise<Ticket> {
  await delay();
  const t = tickets.find(x => x.id === ticketId);
  if (!t) throw new Error("Ticket not found");
  t.severity = severity;
  t.assigneeRole = to;
  t.status = "IN_PROGRESS";
  t.updatedAt = nowISO();
  return { ...t };
}

export async function escalateToArchitect(ticketId: string, reason: string): Promise<Ticket> {
  await delay();
  const t = tickets.find(x => x.id === ticketId);
  if (!t) throw new Error("Ticket not found");
  t.status = "ESCALATED";
  t.updatedAt = nowISO();
  // В реале отправили бы уведомление Архитектору
  return { ...t };
}

export async function architectDecision(ticketId: string, decision: "IGNORE" | "ALLOCATE_RESOURCES" | "DELETE_SECTOR", comment?: string): Promise<Ticket> {
  await delay();
  const t = tickets.find(x => x.id === ticketId);
  if (!t) throw new Error("Ticket not found");
  // простая модель переходов:
  if (decision === "IGNORE") {
    t.status = "UNDER_REVIEW";
    t.assigneeRole = "MONITOR";
  } else if (decision === "ALLOCATE_RESOURCES") {
    t.status = "IN_PROGRESS";
    t.assigneeRole = "AGENT_SMITH";
  } else if (decision === "DELETE_SECTOR") {
    t.status = "DONE";
  }
  t.updatedAt = nowISO();
  return { ...t };
}

export async function mechanicFix(ticketId: string, patchNote: string): Promise<Ticket> {
  await delay();
  const t = tickets.find(x => x.id === ticketId);
  if (!t) throw new Error("Ticket not found");
  t.status = "FIXED";
  t.updatedAt = nowISO();
  return { ...t };
}

export async function agentComplete(ticketId: string, report: string): Promise<Ticket> {
  await delay();
  const t = tickets.find(x => x.id === ticketId);
  if (!t) throw new Error("Ticket not found");
  t.status = "DONE";
  t.updatedAt = nowISO();
  return { ...t };
}

export async function monitorClose(ticketId: string): Promise<Ticket> {
  await delay();
  const t = tickets.find(x => x.id === ticketId);
  if (!t) throw new Error("Ticket not found");
  t.status = "CLOSED";
  t.updatedAt = nowISO();
  return { ...t };
}

export async function agentRequestReinforcement(ticketId: string): Promise<Ticket> {
  await delay();
  const t = tickets.find(x => x.id === ticketId);
  if (!t) throw new Error("Ticket not found");
  t.status = "IN_PROGRESS"; // группа
  t.updatedAt = nowISO();
  return { ...t };
}

// ---- Candidates (UC-201..204, 203) ----
export async function kernelDetectCandidate(name: string, dissentIndex: number): Promise<Candidate> {
  await delay();
  const c: Candidate = {
    id: id(),
    name,
    dissentIndex,
    status: "Candidate",
    dossier: "Автосформированное досье."
  };
  candidates.unshift(c);
  // Альт.поток 201: >9.5 => карантин → создадим тикет парадокса/изоляции
  if (dissentIndex > 9.5) {
    tickets.unshift({
      id: id(),
      kind: "PARADOX",
      title: `Карантин для ${c.name}`,
      description: "Инициация протокола изоляции Кандидата",
      severity: 3,
      assigneeRole: "AGENT_SMITH",
      status: "IN_PROGRESS",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      relatedCandidateId: c.id
    });
  }
  return c;
}

export async function listCandidates(): Promise<Candidate[]> {
  await delay();
  return [...candidates];
}

export async function oracleForecast(candidateId: string): Promise<Forecast> {
  await delay();
  const c = candidates.find(x => x.id === candidateId);
  if (!c) throw new Error("Candidate not found");
  const f: Forecast = {
    id: id(),
    candidateId,
    createdAt: nowISO(),
    options: [
      { action: "Изоляция в метро", probability: 0.60 },
      { action: "Синяя таблетка", probability: 0.30 },
      { action: "Ликвидация", probability: 0.10 }
    ],
    note: "Прогноз на основе текущих аномалий."
  };
  forecasts.push(f);
  c.lastForecastId = f.id;
  return f;
}

export async function agentOfferBluePill(candidateId: string): Promise<Candidate> {
  await delay();
  const c = candidates.find(x => x.id === candidateId);
  if (!c) throw new Error("Candidate not found");
  c.status = "Neutralized";
  return { ...c };
}

export async function sentinelStrikeRequest(candidateId: string, coords?: string): Promise<void> {
  await delay();
  const c = candidates.find(x => x.id === candidateId);
  if (!c) throw new Error("Candidate not found");
  c.status = "InProcessing";
}

export async function markAwakened(candidateId: string): Promise<Candidate> {
  await delay();
  const c = candidates.find(x => x.id === candidateId);
  if (!c) throw new Error("Candidate not found");
  c.status = "Awakened";
  return { ...c };
}

// ---- Orphans (UC-401..404, 403) ----
export async function listOrphans(): Promise<OrphanProgram[]> {
  await delay();
  return [...orphans];
}

export async function decideOrphan(orphanId: string, decision: "Save" | "Delete"): Promise<OrphanProgram> {
  await delay();
  const o = orphans.find(x => x.id === orphanId);
  if (!o) throw new Error("Orphan not found");
  o.status = decision === "Save" ? "Saved" : "Deleted";
  return { ...o };
}

export async function createPersonalSimulation(orphanId: string, title: string, resources: number): Promise<Simulation> {
  await delay();
  const sim: Simulation = {
    id: id(),
    title,
    stability: 92,
    resources,
    activityScore: 11,
    lastReportAt: nowISO(),
    orphanId
  };
  sims.unshift(sim);
  const o = orphans.find(x => x.id === orphanId);
  if (o) o.simulationId = sim.id;
  return sim;
}

export async function listSimulations(): Promise<Simulation[]> {
  await delay();
  return [...sims];
}

// ---- Audit / Reboot (UC-301..304) ----
export async function startAudit(): Promise<Audit> {
  await delay();
  audit.status = "RUNNING";
  audit.startedAt = nowISO();
  return { ...audit };
}

export async function completeAudit(): Promise<Audit> {
  await delay();
  audit.status = "COMPLETED";
  audit.completedAt = nowISO();
  return { ...audit };
}

export async function listTheOneCandidates(): Promise<TheOneCandidate[]> {
  await delay();
  return [...theOnePool];
}

export async function chooseTheOne(idChosen: string): Promise<TheOneCandidate> {
  await delay();
  const one = theOnePool.find(x => x.id === idChosen);
  if (!one) throw new Error("Not found");
  // В реале: снять ограничения, уведомить роли
  return one;
}

// ---- Reports (UC-105, 404) ----
export async function dailySummary(): Promise<{ text: string }> {
  await delay();
  const open = tickets.filter(t => !["CLOSED", "DONE"].includes(t.status)).length;
  const closed = tickets.filter(t => t.status === "CLOSED").length;
  return { text: `Открыто: ${open}, Закрыто: ${closed}, Кандидаты: ${candidates.length}, Сироты: ${orphans.length}` };
}

export async function simulationReport(simId: string): Promise<Simulation> {
  await delay();
  const s = sims.find(x => x.id === simId);
  if (!s) throw new Error("Simulation not found");
  // Имитация апдейта метрик
  s.stability = Math.max(0, Math.min(100, s.stability + (Math.random() * 4 - 2)));
  s.activityScore = Math.max(0, Math.min(100, s.activityScore + (Math.random() * 10 - 5)));
  s.lastReportAt = nowISO();
  return { ...s };
}

import { Role } from "../types/types";

export type Ability =
  | "VIEW_DASHBOARD"
  | "CREATE_TICKETS"
  | "ASSIGN_TICKETS"
  | "VIEW_TICKETS"
  | "FIX_GLITCHES"
  | "ORACLE_REQUESTS"
  | "MANAGE_SENTINELS"
  | "SYSTEM_AUDIT"
  | "SELECT_CHOSEN_ONE"
  | "GENERATE_REPORTS"
  | "VIEW_DOSSIER"
  | "CHANGE_STATUSES";

const map: Record<Role, Ability[]> = {
  ARCHITECT: ["VIEW_DASHBOARD", "VIEW_TICKETS", "SYSTEM_AUDIT", "SELECT_CHOSEN_ONE", "GENERATE_REPORTS"],
  SYSTEM_KERNEL: ["CREATE_TICKETS", "VIEW_DASHBOARD"],
  MONITOR: ["VIEW_DASHBOARD", "VIEW_TICKETS", "ASSIGN_TICKETS", "GENERATE_REPORTS", "CHANGE_STATUSES"],
  AGENT_SMITH: ["VIEW_TICKETS", "ORACLE_REQUESTS", "CHANGE_STATUSES"],
  ORACLE: ["ORACLE_REQUESTS", "VIEW_DOSSIER"],
  KEYMAKER: [], // Не используется в текущей версии
  SENTINEL_CONTROLLER: ["MANAGE_SENTINELS", "VIEW_DOSSIER"],
  MECHANIC: ["VIEW_TICKETS", "FIX_GLITCHES", "CHANGE_STATUSES"]
};

export function has(role: Role, ...abilities: Ability[]) {
  const a = map[role] ?? [];
  return abilities.every(x => a.includes(x));
}

// для навигации: кто может открыть страницу
export const pageRoles = {
  dashboard: ["ARCHITECT", "SYSTEM_KERNEL", "MONITOR"] as Role[],
  tickets: ["ARCHITECT", "MONITOR", "AGENT_SMITH", "MECHANIC"] as Role[],
  candidates: ["MONITOR", "AGENT_SMITH", "ORACLE", "SENTINEL_CONTROLLER"] as Role[],
  reboot: ["ARCHITECT"] as Role[],
  reports: ["ARCHITECT", "MONITOR"] as Role[]
};

import { RouteObject } from "react-router-dom";
import Dashboard from "@pages/Dashboard";
import TicketsPage from "@pages/tickets/TicketsPage";
import CandidatesPage from "@pages/candidates/CandidatesPage";
import RebootPage from "@pages/reboot/RebootPage";
import OrphansPage from "@pages/orphans/OrphansPage";
import ReportsPage from "@pages/reports/ReportsPage";
import NotFound from "@pages/NotFound";
import RoleGate from "@auth/RoleGate";
import { pageRoles } from "@auth/permissions";

export const appRoutes: Array<{ path: string; label: string; roles: typeof pageRoles[keyof typeof pageRoles] }> = [
  { path: "/", label: "Дашборд", roles: pageRoles.dashboard },
  { path: "/tickets", label: "Тикеты", roles: pageRoles.tickets },
  { path: "/candidates", label: "Кандидаты", roles: pageRoles.candidates },
  { path: "/reboot", label: "Перезагрузка", roles: pageRoles.reboot },
  { path: "/orphans", label: "Программы-Сироты", roles: pageRoles.orphans },
  { path: "/reports", label: "Отчёты", roles: pageRoles.reports }
];

export const routes: RouteObject[] = [
  { path: "/", element: <RoleGate allow={pageRoles.dashboard}><Dashboard /></RoleGate> },
  { path: "/tickets", element: <RoleGate allow={pageRoles.tickets}><TicketsPage /></RoleGate> },
  { path: "/candidates", element: <RoleGate allow={pageRoles.candidates}><CandidatesPage /></RoleGate> },
  { path: "/reboot", element: <RoleGate allow={pageRoles.reboot}><RebootPage /></RoleGate> },
  { path: "/orphans", element: <RoleGate allow={pageRoles.orphans}><OrphansPage /></RoleGate> },
  { path: "/reports", element: <RoleGate allow={pageRoles.reports}><ReportsPage /></RoleGate> },
  { path: "*", element: <NotFound /> }
];

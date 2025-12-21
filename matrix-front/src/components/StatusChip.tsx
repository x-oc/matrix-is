import { Chip } from "@mui/material";
import { TicketStatus } from "../types";

export default function StatusChip({ status }: { status: TicketStatus }) {
  const map: Partial<Record<TicketStatus, "default"|"info"|"warning"|"success"|"error">> = {
    NEW: "default",
    ASSIGNED_MONITOR: "info",
    IN_PROGRESS: "warning",
    FIXED: "info",
    DONE: "success",
    UNDER_REVIEW: "info",
    ESCALATED: "warning",
    AWAITING_DECISION: "info",
    CLOSED: "success"
  };
  return <Chip size="small" color={map[status]} label={status} />;
}

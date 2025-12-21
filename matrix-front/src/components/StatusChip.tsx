import { Chip } from "@mui/material";
import { TicketStatus } from "../types/types";

export default function StatusChip({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, "default" | "info" | "warning" | "success" | "error"> = {
    NEW: "default",
    IN_PROGRESS: "warning",
    UNDER_REVIEW: "info",
    CLOSED: "success",
    ESCALATED: "error"
  };
  
  const labels: Record<TicketStatus, string> = {
    NEW: "Новый",
    IN_PROGRESS: "В работе",
    UNDER_REVIEW: "На проверке",
    CLOSED: "Закрыт",
    ESCALATED: "Эскалирован"
  };
  
  return <Chip size="small" color={map[status]} label={labels[status]} />;
}

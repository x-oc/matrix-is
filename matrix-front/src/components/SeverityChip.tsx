import { Chip } from "@mui/material";
import { Severity } from "../types/types";

export default function SeverityChip({ s }: { s: Severity }) {
  const color = s === 3 ? "error" : s === 2 ? "warning" : "default";
  const labels = ["Низкий", "Средний", "Высокий"];
  return <Chip size="small" color={color as any} label={labels[s - 1]} />;
}

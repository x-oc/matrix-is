import { Chip } from "@mui/material";
import { Severity } from "../types/types";

export default function SeverityChip({ s }: { s: Severity }) {
  const color = s === 3 ? "error" : s === 2 ? "warning" : "default";
  return <Chip size="small" color={color as any} label={`Уровень ${s}`} />;
}

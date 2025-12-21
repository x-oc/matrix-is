import { Chip } from "@mui/material";
import { Role } from "../types/types";

const labels: Record<Role, string> = {
  ARCHITECT: "🧠 Архитектор",
  SYSTEM_KERNEL: "⚙️ Системное Ядро",
  MONITOR: "👁️ Смотритель",
  AGENT_SMITH: "🕴️ Агент Смит",
  ORACLE: "🔮 Оракул",
  KEYMAKER: "🔑 Хранитель",
  SENTINEL_CONTROLLER: "🤖 Контроллер Сентинелей",
  MECHANIC: "🛠️ Механик"
};

const roleColors: Record<Role, string> = {
  ARCHITECT: "#ff6b6b",
  SYSTEM_KERNEL: "#4ecdc4",
  MONITOR: "#45b7d1",
  AGENT_SMITH: "#96ceb4",
  ORACLE: "#feca57",
  KEYMAKER: "#ff9ff3",
  SENTINEL_CONTROLLER: "#54a0ff",
  MECHANIC: "#5f27cd"
};

export default function RoleBadge({ role }: { role: Role }) {
  return (
      <Chip
          size="small"
          label={labels[role]}
          variant="outlined"
          sx={{
            borderColor: roleColors[role],
            color: roleColors[role],
            fontWeight: 600,
            background: `rgba(${parseInt(roleColors[role].slice(1, 3), 16)}, ${parseInt(roleColors[role].slice(3, 5), 16)}, ${parseInt(roleColors[role].slice(5, 7), 16)}, 0.1)`,
            "&:hover": {
              background: `rgba(${parseInt(roleColors[role].slice(1, 3), 16)}, ${parseInt(roleColors[role].slice(3, 5), 16)}, ${parseInt(roleColors[role].slice(5, 7), 16)}, 0.2)`
            }
          }}
      />
  );
}

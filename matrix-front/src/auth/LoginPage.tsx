import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import { Role } from "../types/types";

interface LoginPageProps {
  onLogin: (username: string, role: Role) => void;
}

const roleDescriptions: Record<Role, string> = {
  ARCHITECT: "Архитектор - управляет системой и принимает критические решения",
  KERNEL: "Ядро - создает глитчи и обнаруживает кандидатов",
  MONITOR: "Смотритель - классифицирует и эскалирует тикеты",
  AGENT_SMITH: "Агент Смит - выполняет задания и анализирует кандидатов",
  ORACLE: "Оракул - предсказывает судьбы кандидатов",
  KEYMAKER: "Ключник - работает с программами-сиротами",
  SENTINEL_CTRL: "Контроллер Сентинелей - управляет защитными системами",
  MECHANIC: "Механик - исправляет технические проблемы",
};

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("MONITOR");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Введите имя пользователя");
      return;
    }

    setError("");
    onLogin(username.trim(), role);
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ minHeight: "100vh" }}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Paper
          elevation={12}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 500,
            borderRadius: 3,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              THE MATRIX
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Система управления
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              autoComplete="username"
              autoFocus
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Роль</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                label="Роль"
              >
                {Object.entries(roleDescriptions).map(([roleKey]) => (
                  <MenuItem key={roleKey} value={roleKey}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {roleKey}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Card sx={{ mt: 3, bgcolor: "grey.50" }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Выбранная роль: {role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {roleDescriptions[role]}
                </Typography>
              </CardContent>
            </Card>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                "&:hover": {
                  background: "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
                },
              }}
            >
              Войти в систему
            </Button>
          </form>

          <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", display: "block" }}>
            Внимание: роль нельзя будет изменить после входа
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

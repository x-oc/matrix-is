import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import { login } from "../api/client";
import { useAuth } from "./useAuth";

export default function LoginPage() {
  const { login: authLogin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError("Введите имя пользователя и пароль");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const authResponse = await login(username.trim(), password.trim());
      
      // Логин через контекст с данными от сервера
      authLogin(
        authResponse.username, 
        authResponse.role, 
        authResponse.userId
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Неверное имя пользователя или пароль");
    } finally {
      setIsLoading(false);
    }
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
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
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
              {isLoading ? "Вход..." : "Войти в систему"}
            </Button>
          </form>

          <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", display: "block" }}>
            Для демо используйте данные из базы данных
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

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
  CircularProgress,
} from "@mui/material";
import { login } from "../api/client";
import { useAuth } from "./useAuth";

export default function LoginPage() {
  const { login: authLogin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError("Введите имя пользователя и пароль");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setDebugInfo("Начинается процесс авторизации...");
      
      console.log("🔐 [Login Attempt]", { username: username.trim() });
      
      const authResponse = await login(username.trim(), password.trim());
      
      console.log("✅ [Login Success]", authResponse);
      setDebugInfo(`Авторизация успешна. Роль: ${authResponse.role}, ID: ${authResponse.userId}`);
      
      // Проверяем данные перед логином
      if (!authResponse.userId || !authResponse.role || !authResponse.username) {
        throw new Error("Некорректные данные от сервера");
      }
      
      // Логин через контекст с данными от сервера
      authLogin(
        authResponse.username, 
        authResponse.role, 
        authResponse.userId
      );
      
      setDebugInfo("Перенаправление на главную страницу...");
      
    } catch (err: any) {
      console.error("❌ [Login Error]", err);
      
      let errorMessage = "Ошибка авторизации";
      
      if (err.response) {
        // Сервер ответил с ошибкой
        setDebugInfo(`Статус: ${err.response.status}, Данные: ${JSON.stringify(err.response.data)}`);
        errorMessage = err.response.data?.message || `Ошибка ${err.response.status}`;
      } else if (err.request) {
        // Запрос был сделан, но ответ не получен
        setDebugInfo("Нет ответа от сервера. Проверьте: 1) Запущен ли бэкенд, 2) Адрес API: " + import.meta.env.VITE_API_BASE_URL);
        errorMessage = "Сервер не отвечает. Проверьте подключение.";
      } else {
        // Ошибка при настройке запроса
        setDebugInfo(`Ошибка настройки: ${err.message}`);
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка окружения при загрузке страницы
  console.log("🌐 [Environment]", {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    hasToken: !!localStorage.getItem('token')
  });

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
              <Typography variant="body2" fontWeight="bold">{error}</Typography>
              {debugInfo && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block', fontFamily: 'monospace' }}>
                  {debugInfo}
                </Typography>
              )}
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
              helperText="Попробуйте: admin, kernel, monitor"
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
              helperText="Попробуйте: password123"
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
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Войти в систему"}
            </Button>
          </form>

          <Card sx={{ mt: 2, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                <strong>Информация об окружении:</strong><br />
                API: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}<br />
                Токен: {localStorage.getItem('token') ? 'Есть' : 'Нет'}
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", display: "block", mt: 2 }}>
            Для демо используйте данные из базы данных
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

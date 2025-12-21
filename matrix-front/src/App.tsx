import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import MainLayout from "@layouts/MainLayout";
import AuthProvider from "@auth/AuthProvider";
import LoginPage from "@auth/LoginPage";
import { useAuth } from "@auth/useAuth";
import { Box, CircularProgress } from "@mui/material";
import "./styles/global.css";

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const content = useRoutes(routes);

  // Показываем загрузку пока проверяется статус аутентификации
  if (isAuthenticated === undefined || (isAuthenticated && !user)) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainLayout>{content}</MainLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

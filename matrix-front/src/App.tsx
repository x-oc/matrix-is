import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import MainLayout from "@layouts/MainLayout";
import AuthProvider from "@auth/AuthProvider";
import LoginPage from "@auth/LoginPage";
import { useAuth } from "@auth/useAuth";
import "./styles/global.css";

function AppContent() {
  const { isAuthenticated, login } = useAuth();
  const content = useRoutes(routes);

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
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

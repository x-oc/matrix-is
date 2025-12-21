import { useState, useCallback, useEffect } from "react";
import type { Role } from "../types/types";
import { AuthCtx, type User } from "./auth-context";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Проверяем сохраненную сессию при монтировании
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUserId = localStorage.getItem('userId');
    const savedUsername = localStorage.getItem('username');
    const savedRole = localStorage.getItem('role');

    if (token && savedUserId && savedUsername && savedRole) {
      // Восстанавливаем пользователя из localStorage
      setUser({
        id: parseInt(savedUserId),
        username: savedUsername,
        role: savedRole as Role
      });
    }
    
    setIsInitialized(true);
  }, []);

  const login = useCallback((username: string, role: Role, userId: number) => {
    const userData: User = { id: userId, username, role };
    setUser(userData);
    
    // Сохраняем данные пользователя (кроме пароля) в localStorage
    localStorage.setItem('userId', userId.toString());
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    
    // Токен уже сохранен в api/client.ts
  }, []);

  const logout = useCallback(() => {
    // Очищаем все данные авторизации
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    
    setUser(null);
  }, []);

  const isAuthenticated = user !== null;

  // Не рендерим детей пока не инициализировали авторизацию
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthCtx.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated 
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

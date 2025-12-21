import { useState, useCallback } from "react";
import type { Role } from "../types/types";
import { AuthCtx, type User } from "./auth-context";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((username: string, role: Role, userId: number) => {
    setUser({ id: userId, username, role });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
  }, []);

  const isAuthenticated = user !== null;

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

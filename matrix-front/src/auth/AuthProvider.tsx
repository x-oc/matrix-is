import { useState, useCallback } from "react";
import type { Role } from "../types";
import { AuthCtx, type User } from "./auth-context";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((username: string, role: Role) => {
    setUser({ username, role });
  }, []);

  const logout = useCallback(() => {
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

import { useContext } from "react";
import { AuthCtx } from "./auth-context";
import type { Role } from "../types";

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}

// Удобный хук для получения роли текущего пользователя
export function useRole(): { role: Role | null; isAuthenticated: boolean } {
  const { user, isAuthenticated } = useAuth();
  return {
    role: user?.role || null,
    isAuthenticated,
  };
}

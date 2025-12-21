import { useContext } from "react";
import { AuthCtx } from "./auth-context";
import type { Role } from "../types/types";

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRole(): { role: Role | null; isAuthenticated: boolean } {
  const { user, isAuthenticated } = useAuth();
  return {
    role: user?.role || null,
    isAuthenticated,
  };
}

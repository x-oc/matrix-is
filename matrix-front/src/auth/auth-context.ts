import { createContext } from "react";
import type { Role } from "../types/types";

export interface User {
  username: string;
  role: Role;
}

export type AuthState = { 
  user: User | null;
  login: (username: string, role: Role) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

// Не экспортируем никакие компоненты отсюда
export const AuthCtx = createContext<AuthState | null>(null);

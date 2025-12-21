import { createContext } from "react";
import type { Role } from "../types/types";

export interface User {
  id: number;
  username: string;
  role: Role;
}

export type AuthState = { 
  user: User | null;
  login: (username: string, role: Role, userId: number) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

export const AuthCtx = createContext<AuthState | null>(null);

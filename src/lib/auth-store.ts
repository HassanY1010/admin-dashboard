"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { decodeJwt } from "jose";
import type { UserRole } from "@/types/api";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_token", token);
        }
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_token");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const decoded = decodeJwt(token);
    const exp = decoded.exp;
    if (!exp) return false;
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}
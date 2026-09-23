"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { getTokens, setTokens } from "./tokenStore";
import type {
  AuthTokens,
  ILoginResponse,
  IUser,
  LoginPayload,
} from "./types/auth";
import { post } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoints";

export type AuthState = {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<ILoginResponse>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as IUser;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [session, setSession] = useState<AuthTokens | null>(() => getTokens());

  const login = useCallback(
    async (payload: LoginPayload): Promise<ILoginResponse> => {
      const res = await post<ILoginResponse, LoginPayload>(
        ENDPOINTS.auth.login,
        payload,
        { requiresAuth: false },
      );

      if (res?.accessToken) {
        const tokens: AuthTokens = {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken ?? "",
        };

        // Save to token store and local state
        setTokens(tokens);
        setSession(tokens);

        if (res.user) {
          setUser(res.user);
          localStorage.setItem("user", JSON.stringify(res.user));
        }
      }

      return res;
    },
    [],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: !!session,
      login,
    }),
    [user, session, login],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return auth;
}

"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ILoginResponse,
  IUser,
  LoginPayload,
  ISignUpPayload,
} from "./types/auth";
import { post } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoints";
import {
  clearTokens,
  getTokens,
  setTokens,
  subscribeToTokens,
} from "./tokenStore";

export type AuthState = {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<ILoginResponse>;
  signup: (payload: ISignUpPayload) => Promise<IUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // const [user, setUser] = useState<IUser | null>(null);
  // const [accessToken, setAccessToken] = useState<string | null>(
  //   () => getTokens()?.accessToken ?? null,
  // );

  // // Sync React state directly with tokenManager updates
  // useEffect(() => {
  //   const storedUser = localStorage.getItem("user");
  //   if (storedUser) {
  //     try {
  //       setUser(JSON.parse(storedUser));
  //     } catch {
  //       localStorage.removeItem("user");
  //     }
  //   }

  //   // Subscribe to token changes (e.g., login, logout, refresh, cross-tab changes)
  //   const unsubscribe = subscribeToTokens((newTokens) => {
  //     setAccessToken(newTokens?.accessToken ?? null);
  //     if (!newTokens) {
  //       setUser(null);
  //       localStorage.removeItem("user");
  //     }
  //   });

  //   return unsubscribe;
  // }, []);

  const [user, setUser] = useState<IUser | null>(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as IUser;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(
    () => getTokens()?.accessToken ?? null,
  );

  useEffect(() => {
    const unsubscribe = subscribeToTokens((newTokens) => {
      setAccessToken(newTokens?.accessToken ?? null);

      if (!newTokens) {
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    return unsubscribe;
  }, []);

  // Login handler using tokenManager
  const login = useCallback(
    async (payload: LoginPayload): Promise<ILoginResponse> => {
      const res = await post<ILoginResponse, LoginPayload>(
        ENDPOINTS.auth.login,
        payload,
        { requiresAuth: false },
      );

      if (res?.accessToken) {
        // Save tokens in tokenManager (handles both accessToken and optional refreshToken)
        setTokens({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken ?? null,
        });

        if (res.user) {
          setUser(res.user);
          localStorage.setItem("user", JSON.stringify(res.user));
        }
      }

      return res;
    },
    [],
  );

  // Logout handler clearing tokenManager
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    clearTokens(); // Resets token state and clears localStorage automatically
  }, []);

  // Signup handler
  const signup = useCallback(
    async (payload: ISignUpPayload): Promise<IUser> => {
      return await post<IUser, ISignUpPayload>(ENDPOINTS.auth.signup, payload, {
        requiresAuth: false,
      });
    },
    [],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      login,
      signup,
      logout,
    }),
    [user, accessToken, login, signup, logout],
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

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
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<ILoginResponse>;
  signup: (payload: ISignUpPayload) => Promise<IUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Subscribe to token changes
    const unsubscribe = subscribeToTokens((newTokens) => {
      setAccessToken(newTokens?.accessToken ?? null);

      if (!newTokens) {
        setUser(null);
        try {
          localStorage.removeItem("user");
        } catch {
          // Ignore storage restrictions
        }
      }
    });

    // 2. Schedule client hydration after mount to avoid ESLint synchronous setState error
    const frameId = requestAnimationFrame(() => {
      const initialTokens = getTokens();
      if (initialTokens?.accessToken) {
        setAccessToken(initialTokens.accessToken);
      }

      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser) as IUser);
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
      unsubscribe();
    };
  }, []);

  // Login handler
  const login = useCallback(
    async (payload: LoginPayload): Promise<ILoginResponse> => {
      const res = await post<ILoginResponse, LoginPayload>(
        ENDPOINTS.auth.login,
        payload,
        { requiresAuth: false },
      );

      if (res?.accessToken) {
        setTokens({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken ?? null,
        });

        if (res.user) {
          setUser(res.user);
          try {
            localStorage.setItem("user", JSON.stringify(res.user));
          } catch (e) {
            console.error("Failed to save user to localStorage:", e);
          }
        }
      }

      return res;
    },
    [],
  );

  // Logout handler
  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem("user");
    } catch {
      // Safely ignore storage block errors
    }
    clearTokens();
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
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, accessToken, isLoading, login, signup, logout],
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

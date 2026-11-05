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
  GoogleLoginPayload,
  ILoginResponse,
  IUser,
  LoginPayload,
  ISignUpPayload,
} from "./types/auth";
import { post } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
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
  signup: (payload: ISignUpPayload) => Promise<ILoginResponse>;
  loginWithGoogle: (payload: GoogleLoginPayload) => Promise<ILoginResponse>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

// Saves a successful login/signup response: tokens go to the token store,
// the user to localStorage for hydration on the next visit.
function persistSession(response: ILoginResponse) {
  setTokens({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken ?? null,
  });

  if (!response.user) return;

  try {
    localStorage.setItem("user", JSON.stringify(response.user));
  } catch (e) {
    console.error("Failed to save user to localStorage:", e);
  }
}

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
        persistSession(res);
        if (res.user) setUser(res.user);
      }

      return res;
    },
    [],
  );

  // Updated Logout handler
  const logout = useCallback(async () => {
    try {
      // 1. Fire request to backend to invalidate refreshTokenHash in DB
      await post(ENDPOINTS.auth.logout, {}, { requiresAuth: true });
    } catch (error) {
      console.error("Logout request failed on server:", error);
    } finally {
      // 2. Always clean up client-side storage regardless of network result
      setUser(null);
      try {
        localStorage.removeItem("user");
      } catch {
        // Safely ignore storage block errors
      }
      clearTokens();
    }
  }, []);

  const signup = useCallback(
    async (payload: ISignUpPayload): Promise<ILoginResponse> => {
      const res = await post<ILoginResponse, ISignUpPayload>(
        ENDPOINTS.auth.signup,
        payload,
        { requiresAuth: false },
      );

      if (res?.accessToken) {
        persistSession(res);
        if (res.user) setUser(res.user);
      }

      return res;
    },
    [],
  );

  const loginWithGoogle = useCallback(
    async (payload: GoogleLoginPayload): Promise<ILoginResponse> => {
      const res = await post<ILoginResponse, GoogleLoginPayload>(
        ENDPOINTS.auth.google,
        payload,
        { requiresAuth: false },
      );

      if (res?.accessToken) {
        persistSession(res);
        if (res.user) setUser(res.user);
      }

      return res;
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
      loginWithGoogle,
      logout,
    }),
    [user, accessToken, isLoading, login, signup, loginWithGoogle, logout],
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

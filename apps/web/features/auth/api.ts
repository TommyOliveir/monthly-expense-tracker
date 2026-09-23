import type { IUser } from "@/features/auth/types/auth";
import { get, post } from "./client";
import { ENDPOINTS } from "../../api/endpoints";

type VerifyOtpRequest = {
  email: string;
  code: string;
};

type VerifyOtpResponse = {
  access_token: string;
  refresh_token: string;
};

type SendOtpResponse = {
  message: string;
};

export function sendOtp(email: string) {
  return post<SendOtpResponse, { email: string }>(
    ENDPOINTS.auth.sendOtp,
    { email },
    {
      requiresAuth: false,
    },
  );
}

export function login(body: VerifyOtpRequest) {
  return post<VerifyOtpResponse, VerifyOtpRequest>(ENDPOINTS.auth.login, body, {
    requiresAuth: false,
  });
}

export function logoutAPI({ refreshToken }: { refreshToken: string | null }) {
  return post<null, { refresh_token: string | null }>(
    ENDPOINTS.auth.logout,
    {
      refresh_token: refreshToken,
    },
    {
      requiresAuth: false,
    },
  );
}

export async function getLoggedUser(): Promise<{ user: IUser }> {
  const user = await get<IUser>(ENDPOINTS.auth.me);

  return { user };
}

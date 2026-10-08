import { ENDPOINTS } from "../../api/endpoints";
import { get, post } from "../../api/client";
import { IUser } from "./types/auth";

type VerifyOtpRequest = {
  email: string;
  code: string;
};

type VerifyOtpResponse = {
  access_token: string;
  refresh_token: string;
};

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
// put this soon user should be call
export async function getLoggedUser(): Promise<{ user: IUser }> {
  const user = await get<IUser>(ENDPOINTS.auth.me);

  return { user };
}

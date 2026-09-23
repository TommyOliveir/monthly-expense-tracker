export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IUser {
  email: string;
  id: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ILoginResponse {
  user: IUser;
  accessToken: string;
}

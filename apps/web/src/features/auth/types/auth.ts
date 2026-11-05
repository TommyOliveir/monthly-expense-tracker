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

export interface GoogleLoginPayload {
  // The ID token Google Identity Services returns to the browser.
  credential: string;
}

export interface ILoginResponse extends AuthTokens {
  user: IUser;
}

export interface ISignUpPayload {
  name?: string;
  email: string;
  password: string;
}

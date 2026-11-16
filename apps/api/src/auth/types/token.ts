export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokenPayload = {
  sub: string;
  email: string;
  // Id of the row in `sessions` this refresh token belongs to.
  sid: string;
  iat?: number;
  exp?: number;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

// Stamped into every token so one kind can never be accepted as the other.
export type TokenType = 'access' | 'refresh';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  // Id of the row in `sessions` this token belongs to; checked on every request.
  sid?: string;
  type?: TokenType;
  iat?: number;
  exp?: number;
};

export type RefreshTokenPayload = {
  sub: string;
  email: string;
  // Id of the row in `sessions` this refresh token belongs to.
  sid: string;
  // Missing on refresh tokens issued before `type` existed.
  type?: TokenType;
  iat?: number;
  exp?: number;
};

import type { Request } from 'express';

export interface IAuthenticatedRequest extends Request {
  user: IAuthenticatedUser;
}

export interface IAuthenticatedUser {
  id: string;
  email: string;
}

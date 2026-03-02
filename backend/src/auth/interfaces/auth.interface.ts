import { Role } from 'generated/prisma/enums';

export interface RefreshTokenPayload {
  sub: string;
}

export interface AccessTokenPayload extends RefreshTokenPayload {
  email: string;
  role: Role;
}

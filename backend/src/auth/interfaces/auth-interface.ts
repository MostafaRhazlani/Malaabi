import { Role } from 'generated/prisma/enums';

export interface RefreshTokenPayload {
  sub: string;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

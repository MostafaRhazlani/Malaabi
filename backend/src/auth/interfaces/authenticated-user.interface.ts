import { Role } from 'generated/prisma/enums';

export interface AuthenticatedUser {
  user_id: string;
  email: string;
  role: Role;
}

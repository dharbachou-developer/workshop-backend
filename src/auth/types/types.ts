export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
}

export interface RequestUser {
  id: string;
  email: string;
  roles: UserRole[];
}

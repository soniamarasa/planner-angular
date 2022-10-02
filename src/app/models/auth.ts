import { User } from './user';

export interface Auth {
  user?: User | null;
  rememberMe?: boolean;
  isAuthenticated?: boolean;
}

export interface Tokens {
	token?: string | null;
	accessToken?: string | null;
	refreshToken?: string | null;
	refreshTokenExpiresAt?: Date | null;
}
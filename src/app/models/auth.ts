import { User } from './user';

export interface Auth {
  user?: User | null;
  rememberMe?: boolean;
  isAuthenticated?: boolean;
}

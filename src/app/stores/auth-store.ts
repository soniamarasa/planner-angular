import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// --- Interfaces ---
import { Auth } from '../models/auth';

import { UserService } from '../services/user.service';

interface IAuthState extends Auth {}

const INITIAL_STATE: IAuthState = {
  isAuthenticated: false,
};

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private _authState = new BehaviorSubject<IAuthState>(
    this.authStateStorage || INITIAL_STATE
  );
  readonly authState$ = this._authState.asObservable();

  constructor(private userService: UserService) {}

  get authStateStorage() {
    return this.userService.get('auth');
  }

  login({ user }: IAuthState) {
    const state = this._authState.value;

    const data = {
      ...state,
      ...user,
      isAuthenticated: true,
    };

    this._authState.next(data);

    this.userService.set('auth', data);
    this.userService.set('idUser', data.user?.id);

    return this._authState.asObservable();
  }

  logout() {
    this._authState.next({
      user: null,
      rememberMe: false,
      isAuthenticated: false,
    });

    this.userService.remove('auth');
    this.userService.remove('idUser');

    return this._authState.asObservable();
  }
}

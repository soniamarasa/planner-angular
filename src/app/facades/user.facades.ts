import { Injectable } from '@angular/core';
import { shareReplay, tap } from 'rxjs';

// --- Services ---
import { UserService } from '../services/user.service';

// --- Stores ---
import { AuthStore } from '../stores/auth-store';

// --- Interfaces ---
import { User } from '../models/user';
import { ILoginBody } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class UserFacade {
  readonly authState$ = this.authStore.authState$;

  idUser = this.userService.get('idUser');
  user = this.userService.get('auth')?.user

  constructor(private userService: UserService, private authStore: AuthStore) {}

  login({ email, password }: ILoginBody) {
    return this.userService
      .login({ email, password })
      .pipe(tap((user) => this.authStore.login({ user })));
  }

  retrievePassword(email: User['email'], host: string) {
    return this.userService.retrievePassword(email, host);
  }

  resetPassword(password: User['password'], token: User['token']) {
    return this.userService.resetPassword(password, token);
  }

  logout() {
    return this.userService.logout(this.idUser).pipe(
      shareReplay(),
      tap(() => this.authStore.logout())
    );
  }

  newUser(user: User) {
    return this.userService.createAccount(user).pipe(shareReplay());
  }

  getUser() {
    return this.userService.getUser(this.idUser).pipe(shareReplay());
  }

  updateUser(user: User) {
    return this.userService.updateUser(user, this.idUser).pipe(shareReplay());
  }
}

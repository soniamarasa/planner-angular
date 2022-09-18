import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay } from 'rxjs';
import { environment } from './../../environments/environment';
import { User } from '../models/user';

export interface ILoginBody {
  email: User['email'];
  password: User['password'];
}

export interface IRefreshTokenBody {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly _http: HttpClient) {}

  // --- POST endpoints ---
  login(body: ILoginBody) {
    return this._http
      .post<User>(`${environment.url}/login`, { body })
      .pipe(shareReplay());
  }

  retrievePassword(email: User['email']) {
    return this._http
      .post<any>(`${environment.url}/retrievePassword`, {
        email,
      })
      .pipe(shareReplay());
  }

  resetPassword(password: User['email'], userId: User['_id']) {
    return this._http
      .post<any>(`${environment.url}/resetPassword`, {
        password,
        userId,
      })
      .pipe(shareReplay());
  }

  logout(id: User['_id']) {
    return this._http
      .post(`${environment.url}/logout/${id}`, null)
      .pipe(shareReplay());
  }

  createAccount(user: User) {
    return this._http
      .post<any>(`${environment.url}/createAccount`, { user })
      .pipe(shareReplay());
  }

  updateUser(user: User) {
    return this._http
      .put<User>(`${environment.url}/updateUser`, { user })
      .pipe(shareReplay());
  }
}

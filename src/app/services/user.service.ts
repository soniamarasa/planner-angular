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
export class UserService {
  constructor(private readonly _http: HttpClient) {}

  // --- POST endpoints ---
  login(body: ILoginBody) {
    return this._http
      .post<User>(`${environment.url}/login`, { ...body })
      .pipe(shareReplay());
  }

  retrievePassword(email: User['email']) {
    return this._http
      .post<any>(`${environment.url}/retrievePassword`, 
        email
      )
      .pipe(shareReplay());
  }

  resetPassword(password: User['password'], userId: User['id']) {
    return this._http
      .post<any>(`${environment.url}/resetPassword`, {
        password,
        userId,
      })
      .pipe(shareReplay());
  }

  logout(id: User['id']) {
    return this._http
      .post(`${environment.url}/logout`, { id })
      .pipe(shareReplay());
  }

  createAccount(user: User) {
    return this._http
      .post<any>(`${environment.url}/createAccount`, { user })
      .pipe(shareReplay());
  }

  getUser(id: User['id']) {
    return this._http
      .get<any>(`${environment.url}/user/${id}`)
      .pipe(shareReplay());
  }

  updateUser(user: User) {
    return this._http
      .put<User>(`${environment.url}/updateUser`, { user })
      .pipe(shareReplay());
  }

  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string) {
    return JSON.parse(localStorage.getItem(key) as string);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}

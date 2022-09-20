import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Item } from '../models/item';
import { BehaviorSubject, Observable } from 'rxjs';
import { share, shareReplay, take, tap } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {

  private _reloadMecanism = new BehaviorSubject<number>(0);
  
  constructor(private http: HttpClient) {}

  getAll(userId: User['id'], where: any): Observable<Item[]> {
    return this.http.get<Item[]>(`${environment.url}/getItems/${userId}/${where}`);
  }

  getAllItems(userId: User['id']): Observable<Item[]> {
    return this.http.get<Item[]>(`${environment.url}/getItems/${userId}`).pipe(shareReplay());
  }

  newItem(userId: User['id'], item: Item): Observable<Item> {
    return this.http
      .post<Item>(`${environment.url}/postItem/${userId}`, item)
      .pipe(shareReplay());
  }

  editItem(userId: User['id'], id: string, item: Item): Observable<Item> {
    return this.http
      .put<Item>(`${environment.url}/editItem/${userId}/${id}`, item)
      .pipe(shareReplay());
  }

  updateStatus(userId: User['id'], id: any, item: Item): Observable<Item> {
    return this.http
      .put<Item>(`${environment.url}/updateStatus/${userId}/${id}`, item)
      .pipe(shareReplay());
  }

  deleteItem(userId: User['id'], id: string): Observable<any> {
    return this.http.delete<any>(`${environment.url}/deleteItem/${userId}/${id}`);
  }

  resetData(userId: User['id']): Observable<any> {
    return this.http.delete<any>(`${environment.url}/${userId}/reset`);
  }

  reload() {
    this._reloadMecanism.next(this._reloadMecanism.value + 1);
  }
}

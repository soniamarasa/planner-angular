import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Item } from '../models/item';
import { BehaviorSubject, Observable } from 'rxjs';
import { share, shareReplay, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {

  private _reloadMecanism = new BehaviorSubject<number>(0);
  
  constructor(private http: HttpClient) {}

  getAll(where: any): Observable<Item[]> {
    return this.http.get<Item[]>(`${environment.url}/getItems/${where}`);
  }

  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${environment.url}/getItems`).pipe(share());
  }

  newItem(item: Item): Observable<Item> {
    return this.http
      .post<Item>(`${environment.url}/postItem`, item)
      .pipe(shareReplay());
  }

  editItem(id: string, item: Item): Observable<Item> {
    return this.http
      .put<Item>(`${environment.url}/editItem/${id}`, item)
      .pipe(shareReplay());
  }

  updateStatus(id: any, item: Item): Observable<Item> {
    return this.http
      .put<Item>(`${environment.url}/updateStatus/${id}`, item)
      .pipe(shareReplay());
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.url}/deleteItem/${id}`);
  }

  resetData(): Observable<any> {
    return this.http.delete<any>(`${environment.url}/reset`);
  }

  reload() {
    this._reloadMecanism.next(this._reloadMecanism.value + 1);
  }
}

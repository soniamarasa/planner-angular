import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Item } from '../models/item';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private _reloadMecanism = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  getAll(userId: User['id'], where: any, weekStart?: string): Observable<Item[]> {
    let params = new HttpParams();
    if (weekStart) {
      params = params.set('week_start', weekStart);
    }
    return this.http.get<Item[]>(`${environment.url}/getItems/${userId}/${where}`, { params });
  }

  getAllItems(userId: User['id'], weekStart?: string, allItems = false): Observable<Item[]> {
    let params = new HttpParams();
    if (weekStart) {
      params = params.set('week_start', weekStart);
    }
    if (allItems) {
      params = params.set('all_items', 'true');
    }
    return this.http.get<Item[]>(`${environment.url}/getItems/${userId}`, { params });
  }

  newItem(userId: User['id'], item: Item & { week_start?: string }): Observable<Item[]> {
    return this.http.post<Item[]>(`${environment.url}/postItem/${userId}`, item).pipe(shareReplay());
  }

  editItem(userId: User['id'], id: string, item: Item & { week_start?: string }, weekStart?: string): Observable<Item> {
    let params = new HttpParams();
    if (weekStart) {
      params = params.set('week_start', weekStart);
    }
    return this.http.put<Item>(`${environment.url}/editItem/${userId}/${id}`, item, { params }).pipe(shareReplay());
  }

  rescheduleItem(
    userId: User['id'],
    id: string,
    payload: { scheduled_date: string; where?: string },
    weekStart?: string
  ): Observable<Item> {
    let params = new HttpParams();
    if (weekStart) {
      params = params.set('week_start', weekStart);
    }
    return this.http.put<Item>(`${environment.url}/rescheduleItem/${userId}/${id}`, payload, { params });
  }

  updateStatus(userId: User['id'], id: any, item: Item): Observable<Item> {
    return this.http.put<Item>(`${environment.url}/updateStatus/${userId}/${id}`, item).pipe(shareReplay());
  }

  deleteItem(userId: User['id'], id: string): Observable<any> {
    return this.http.delete<any>(`${environment.url}/deleteItem/${userId}/${id}`);
  }

  clearWeek(userId: User['id'], weekStart: string): Observable<any> {
    const params = new HttpParams().set('week_start', weekStart);
    return this.http.delete<any>(`${environment.url}/${userId}/week`, { params });
  }

  resetData(userId: User['id']): Observable<any> {
    return this.http.delete<any>(`${environment.url}/${userId}/reset`);
  }

  reload() {
    this._reloadMecanism.next(this._reloadMecanism.value + 1);
  }
}

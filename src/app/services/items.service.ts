import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { __await } from 'tslib'; //->
import { environment } from './../../environments/environment';
import { Item } from '../models/item';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  items = [] as any;
  keys = [] as any;
  currentId = null;

  started = 0;
  finished = 0;
  important = 0;
  canceled = 0;
  notInitiated = 0;
  total = 0;

  types: any;
  valuesType: any;

  totalTasks = 0;

  constructor(private http: HttpClient) {}

  public  getAll(where: any): Observable<Item[]> {
    return this.http.get<Item[]>(`${environment.url}/getItems/${where}`);
  }

  public  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${environment.url}/getItems`);
  }

  // public async renderItems(where: any): Promise<any> {
  //   return await this.httpCl
  //     .get(`${environment.url}/getItems/${where}`)
  //     .toPromise();
  // }

  // public async newItem(item: any): Promise<any> {
  //   return await this.httpCl
  //     .post(`${environment.url}/postItem`, item, { responseType: 'text' })
  //     .toPromise();
  // }
  // public async editItem(id: any, item: any): Promise<any> {
  //   return await this.httpCl
  //     .put(`${environment.url}/editItem/${id}`, item)
  //     .toPromise();
  // }

  // public async updateStatus(id: any, item: any): Promise<any> {
  //   return await this.httpCl
  //     .put(`${environment.url}/updateStatus/${id}`, item)
  //     .toPromise();
  // }

  // public async deleteItem(id: string): Promise<any> {
  //   return await this.httpCl
  //     .delete(`${environment.url}/deleteItem/${id}`, { responseType: 'text' })
  //     .toPromise();
  // }

  // public async resetData(): Promise<any> {
  //   return await this.httpCl
  //     .delete(`${environment.url}/reset`, { responseType: 'text' })
  //     .toPromise();
  // }

  // public async actionsControl(
  //   id: any,
  //   typeAction: any,
  //   where: any,
  //   value: any
  // ): Promise<any> {
  //   if (typeAction === null) {
  //     if (this.currentId !== null) {
  //       this.currentId = null;
  //     } else {
  //       this.currentId = id;
  //     }
  //   } else {
  //     switch (typeAction) {
  //       case 'finished':
  //         const item = {
  //           started: false,
  //           finished: value ? false : true,
  //           important: false,
  //           canceled: false,
  //         };
  //         await this.updateStatus(id, item);
  //         await this.updateItems(where);
  //         break;

  //       case 'started':
  //         const itemSt = {
  //           started: value ? false : true,
  //           finished: false,
  //           important: false,
  //           canceled: false,
  //         };
  //         await this.updateStatus(id, itemSt);
  //         await this.updateItems(where);
  //         break;

  //       case 'canceled':
  //         const itemCanc = {
  //           started: false,
  //           finished: false,
  //           important: false,
  //           canceled: value ? false : true,
  //         };
  //         await this.updateStatus(id, itemCanc);
  //         await this.updateItems(where);
  //         break;

  //       case 'important':
  //         const itemImp = {
  //           started: false,
  //           finished: false,
  //           important: value ? false : true,
  //           canceled: false,
  //         };
  //         await this.updateStatus(id, itemImp);
  //         await this.updateItems(where);
  //         break;

  //       case 'delete':
  //         await this.deleteItem(id);
  //         await this.updateItems(where);
  //         // this.toastr.success('Item deletado com sucesso!');

  //         break;
  //     }

  //     this.currentId = null;
  //   }
  // }

  // async updateItems(where: string): Promise<any> {
  //   let updateItems = await this.renderItems(where);
  //   updateItems = this.idOrder(updateItems);

  //   if (this.items.length === 0) {
  //     this.items.push({ day: where, itemsDay: updateItems });
  //     this.keys.push(where);
  //   } else {
  //     this.items.forEach((dayWithItens: any) => {
  //       if (this.keys.includes(where)) {
  //         if (dayWithItens.day === where) {
  //           dayWithItens.itemsDay = updateItems;
  //         }
  //       } else {
  //         this.items.push({ day: where, itemsDay: updateItems });
  //         this.keys.push(where);
  //       }
  //     });
  //   }

  //   this.items.forEach((day: any) => {
  //     if (day.day === where) {
  //       day.itemsDay.sort((a: any, b: any) => {
  //         return a.id - b.id;
  //       });
  //     }
  //   });
  // }

  // idOrder(array: any): any {
  //   array.forEach((item: any) => {
  //     if (item.type === 'task') {
  //       item.id = 1;
  //     } else if (item.type === 'event') {
  //       item.id = 2;
  //     } else if (item.type === 'appointment') {
  //       item.id = 3;
  //     } else if (item.type === 'note') {
  //       item.id = 4;
  //     } else if (item.type === 'tv') {
  //       item.id = 5;
  //     }
  //   });

  //   return array;
  // }
}

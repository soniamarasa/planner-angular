import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Item } from '../models/item';
import { ItemsService } from '../services/items.service';

@Injectable()
export class ItemsFacade {

  item: any;
  items: any;

  // items = [] as any;
  // keys = [] as any;
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

  constructor(private service: ItemsService) {
    this.service.getAllItems().subscribe((data: any) => {
          this.item = data;
    });
  }

  // getAll(where: any) {
  //   return this.service.getAll(where).subscribe((data: any) => {
  //     this.items = data;
  //   });
  // }

   getAllItems() {
  //   return this.service.getAllItems().subscribe((data: any) => {
  //     this.item = data;
  //   });
   }

  actionsControl(
    id: any,
    typeAction: any,
    where: any,
    value: any
  ): any {
    if (typeAction === null) {
      if (this.currentId !== null) {
        this.currentId = null;
      } else {
        this.currentId = id;
      }
    } else {
      switch (typeAction) {
        case 'finished':
          const item = {
            started: false,
            finished: value ? false : true,
            important: false,
            canceled: false,
          };
          // await this.updateStatus(id, item);
          // await this.updateItems(where);
          break;

        case 'started':
          const itemSt = {
            started: value ? false : true,
            finished: false,
            important: false,
            canceled: false,
          };
          // await this.updateStatus(id, itemSt);
          // await this.updateItems(where);
          break;

        case 'canceled':
          const itemCanc = {
            started: false,
            finished: false,
            important: false,
            canceled: value ? false : true,
          };
          // await this.updateStatus(id, itemCanc);
          // await this.updateItems(where);
          break;

        case 'important':
          const itemImp = {
            started: false,
            finished: false,
            important: value ? false : true,
            canceled: false,
          };
          // await this.updateStatus(id, itemImp);
          // await this.updateItems(where);
          break;

        case 'delete': { 
           return  this.service.deleteItem(id).subscribe((data)=>{
            console.log("success");
          });
        }
    
      
          // await this.updateItems(where);
          // this.toastr.success('Item deletado com sucesso!');

          break;
      }

      this.currentId = null;
    }
  }

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

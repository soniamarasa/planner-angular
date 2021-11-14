import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Item } from '../models/item';
import { ItemsService } from '../services/items.service';
import { ItemSearchState, ItemSearchStore } from '../stores/item-search.store';
import { ItemsStore } from '../stores/items.store';
import { LoadingFacade } from './loading.facade';
import { MessageService } from 'primeng/api';
import { ThemeService } from '../services/theme.service';

@Injectable()
export class ItemsFacade {
  item: any;
  items: any;

  // items = [] as any;
  // keys = [] as any;
  currentId = null;

  // started = 0;
  // finished = 0;
  // important = 0;
  // canceled = 0;
  // notInitiated = 0;
  // total = 0;

  // types: any;
  // valuesType: any;

  // totalTasks = 0;

  public readonly itemsState$ = this.itemsStore.itemsState$;
  public readonly itemSearchState$ = this.itemSearchStore.itemSearchState$;

  constructor(
    private itemsStore: ItemsStore,
    private itemSearchStore: ItemSearchStore,
    private service: ItemsService,
    private loading: LoadingFacade,
    private messageService: MessageService,
    private themeService: ThemeService
  ) {
    this.init();
  }

  init() {
    this.itemSearchState$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => this.loading.setLoading(true)),
        switchMap(() => this.getAllItems()),
        tap(() => this.loading.setLoading(false))
      )
      .subscribe((items) => this.itemsStore.setItems(items));
  }

  getAllItems(): Observable<Item[]> {
    return this.service.getAllItems();
  }

  actionsControl(id: any, typeAction: any, where: any, value: any): any {
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
          this.updateStatus(id, item);
          break;

        case 'started':
          const itemSt = {
            started: value ? false : true,
            finished: false,
            important: false,
            canceled: false,
          };
          this.updateStatus(id, itemSt);
          break;

        case 'canceled':
          const itemCanc = {
            started: false,
            finished: false,
            important: false,
            canceled: value ? false : true,
          };
          this.updateStatus(id, itemCanc);
          break;

        case 'important':
          const itemImp = {
            started: false,
            finished: false,
            important: value ? false : true,
            canceled: false,
          };
          this.updateStatus(id, itemImp);
          break;

        case 'delete':
          {
            this.delete(id);
          }

          break;
      }

      this.currentId = null;
    }
  }

  updateStatus(id: string, item: Item) {
    const updateStatus = this.service.updateStatus(id, item);

    const successObservable = updateStatus.pipe(
      map((itemStatusUpdate: any) => (itemStatusUpdate._id ? true : false)),
      tap(() => this.loading.setLoading(false))
    );

    this.loading.setLoading(true);
    updateStatus.subscribe((itemStatusUpdate) => {
      console.log(itemStatusUpdate);
      this.itemsStore.replacetItem(itemStatusUpdate);
    });
    return successObservable;
  }

  delete(id: string) {
    const deleteObservable = this.service.deleteItem(id);
    const sucessDelete = deleteObservable;

    this.loading.setLoading(true);

    deleteObservable
      .pipe(tap(() => this.loading.setLoading(false)))
      .subscribe((data) => {
        console.log(data);
        this.itemsStore.deleteItem(id);
        this.messageService.add({
          key: 'delete',
          severity: 'success',
          detail: data.message,
        });
      });
    return sucessDelete;
  }

  resetData() {
    const deleteObservable = this.service.resetData();
    const sucessDelete = deleteObservable;

    this.loading.setLoading(true);

    deleteObservable
      .pipe(tap(() => this.loading.setLoading(false)))
      .subscribe((data) => {
        this.itemsStore.reset();
      });
    localStorage.clear();
    this.themeService.theme = 'theme01';
    return sucessDelete;
  }
}

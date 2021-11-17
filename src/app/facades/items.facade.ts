import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import { MessageService } from 'primeng/api';
import { ItemsService } from '../services/items.service';
import { ThemeService } from '../services/theme.service';
import { ItemsStore } from '../stores/items.store';
import { ItemSearchState, ItemSearchStore } from '../stores/item-search.store';
import { LoadingFacade } from './loading.facade';

import { Item } from '../models/item';

@Injectable()
export class ItemsFacade {

  currentId = null;

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

  create(item: Item) {
    const createObservable = this.service.newItem(item);
    const sucessObservable = createObservable.pipe(
      tap(() => this.loading.setLoading(false)),
      map((newItem) => (newItem._id ? true : false))
    );

    this.loading.setLoading(true);

    createObservable.subscribe((newItem: any) => {
      newItem.forEach((item: any) => this.itemsStore.pushItem(item));

      this.messageService.add({
        key: 'create',
        severity: 'success',
        detail: 'Successfully created item',
      });

      this.service.reload();
    });
    return sucessObservable;
  }

  update(id: string, item: Item) {
    const updateItem = this.service.editItem(id, item);

    const successObservable = updateItem.pipe(
      map((itemStatusUpdate: any) => (itemStatusUpdate._id ? true : false)),
      tap(() => this.loading.setLoading(false))
    );

    this.loading.setLoading(true);
    updateItem.subscribe((itemUpdate) => {
      console.log(itemUpdate);
      this.itemsStore.replacetItem(itemUpdate);
    });
    return successObservable;
  }

  updateStatus(id: string, item: Item) {
    const updateStatus = this.service.updateStatus(id, item);

    const successObservable = updateStatus.pipe(
      map((itemStatusUpdate: any) => (itemStatusUpdate._id ? true : false)),
      tap(() => this.loading.setLoading(false))
    );

    this.loading.setLoading(true);
    updateStatus.subscribe((itemStatusUpdate) => {
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
        this.itemsStore.deleteItem(id);
        this.messageService.add({
          key: 'delete',
          severity: 'success',
          detail: 'Successfully deleted item!',
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

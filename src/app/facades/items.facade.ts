import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ItemsService } from '../services/items.service';
import { WeekService } from '../services/week.service';
import { ItemsStore } from '../stores/items.store';
import { ItemSearchStore } from '../stores/item-search.store';
import { WeekStore } from '../stores/week.store';
import { LoadingFacade } from './loading.facade';

import { Item } from '../models/item';

@Injectable()
export class ItemsFacade {
  currentId = null;
  idUser = '';

  public readonly itemsState$ = this.itemsStore.itemsState$;
  public readonly itemSearchState$ = this.itemSearchStore.itemSearchState$;
  public readonly weekState$ = this.weekStore.weekState$;

  public readonly overdueItems$ = this.itemsState$.pipe(
    map((state) => state.items.filter((item) => item.is_overdue))
  );

  constructor(
    private itemsStore: ItemsStore,
    private itemSearchStore: ItemSearchStore,
    private weekStore: WeekStore,
    private weekService: WeekService,
    private service: ItemsService,
    private loading: LoadingFacade,
    private messageService: MessageService,
    private translate: TranslateService
  ) {
    this.weekStore.setWeekStart(this.weekService.toDateKey(this.weekService.getWeekStart()));
    this.init();
  }

  get weekStart(): string {
    return this.weekStore.weekStart;
  }

  init() {
    this.weekStore.weekState$
      .pipe(
        filter((weekState) => !!weekState.weekStart),
        tap(() => this.loading.setLoading(true)),
        switchMap((weekState) =>
          this.getAllItems(weekState.weekStart).pipe(
            catchError(() => {
              this.messageService.add({
                key: 'notification',
                severity: 'error',
                detail: this.translate.instant('toast.loadWeekError'),
              });
              return of([] as Item[]);
            })
          )
        ),
        tap(() => this.loading.setLoading(false))
      )
      .subscribe((items) => this.itemsStore.setItems(items));
  }

  refreshItems(): void {
    if (!this.weekStore.weekStart) {
      return;
    }

    this.weekStore.setWeekStart(this.weekStore.weekStart);
  }

  getAllItems(weekStart?: string): Observable<Item[]> {
    this.idUser = JSON.parse(localStorage.getItem('idUser') as string);
    return this.service.getAllItems(this.idUser, weekStart || this.weekStore.weekStart);
  }

  changeWeek(delta: number): void {
    const monday = this.weekService.parseDateKey(this.weekStore.weekStart);
    const targetMonday = this.weekService.shiftWeek(monday, delta);
    this.weekStore.setWeekStart(this.weekService.toDateKey(targetMonday));
  }

  goToToday(): void {
    const todayMonday = this.weekService.toDateKey(this.weekService.getWeekStart());
    this.weekStore.setWeekStart(todayMonday);
  }

  isCurrentWeekView(): boolean {
    return this.weekService.isCurrentWeek(this.weekService.parseDateKey(this.weekStore.weekStart));
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

  create(item: Item & { week_start?: string; scheduled_date?: string | null }) {
    let weekStart = this.weekStore.weekStart;
    if (item.scheduled_date) {
      weekStart = this.weekService.toDateKey(
        this.weekService.getWeekStart(this.weekService.parseDateKey(item.scheduled_date))
      );
    }

    const payload = {
      ...item,
      week_start: weekStart,
    };
    const createObservable = this.service.newItem(this.idUser, payload);
    const successObservable = createObservable.pipe(
      tap(() => this.loading.setLoading(false)),
      map((newItem: Item[]) => Array.isArray(newItem) && newItem.length > 0)
    );

    this.loading.setLoading(true);

    createObservable.subscribe(() => {
      this.getAllItems().subscribe((items) => this.itemsStore.setItems(items));
      this.messageService.add({
        key: 'notification',
        severity: 'success',
        detail: this.translate.instant('toast.itemCreated'),
      });
    });
    return successObservable;
  }

  update(id: string, item: Item) {
    const updateItem = this.service.editItem(this.idUser, id, item, this.weekStore.weekStart);

    const successObservable = updateItem.pipe(
      map((itemStatusUpdate: Item) => !!itemStatusUpdate.id),
      tap(() => this.loading.setLoading(false))
    );

    this.loading.setLoading(true);
    updateItem.subscribe((itemUpdate) => {
      this.currentId = null;
      this.messageService.add({
        key: 'notification',
        severity: 'success',
        detail: this.translate.instant('toast.itemUpdated'),
      });
      this.itemsStore.replacetItem(itemUpdate);
    });
    return successObservable;
  }

  updateStatus(id: string, item: Item) {
    const updateStatus = this.service.updateStatus(this.idUser, id, item);

    const successObservable = updateStatus.pipe(
      map((itemStatusUpdate: Item) => !!itemStatusUpdate.id),
      tap(() => this.loading.setLoading(false))
    );

    this.loading.setLoading(true);
    updateStatus.subscribe((itemStatusUpdate) => {
      this.itemsStore.replacetItem(itemStatusUpdate);
    });
    return successObservable;
  }

  rescheduleToToday(item: Item): void {
    if (!item.id) {
      return;
    }

    const todayKey = this.weekService.toDateKey(new Date());
    this.loading.setLoading(true);
    this.service
      .rescheduleItem(
        this.idUser,
        item.id,
        { scheduled_date: todayKey },
        this.weekStore.weekStart
      )
      .subscribe({
        next: (updated) => {
          this.itemsStore.replacetItem(updated);
          this.getAllItems().subscribe((items) => this.itemsStore.setItems(items));
          this.loading.setLoading(false);
          this.messageService.add({
            key: 'notification',
            severity: 'success',
            detail: this.translate.instant('toast.taskMovedToday'),
          });
        },
        error: () => this.loading.setLoading(false),
      });
  }

  delete(id: string) {
    const deleteObservable = this.service.deleteItem(this.idUser, id);
    const successDelete = deleteObservable;

    this.loading.setLoading(true);

    deleteObservable
      .pipe(tap(() => this.loading.setLoading(false)))
      .subscribe(() => {
        this.itemsStore.deleteItem(id);
        this.messageService.add({
          key: 'notification',
          severity: 'success',
          detail: this.translate.instant('toast.itemDeleted'),
        });
      });
    return successDelete;
  }

  clearWeek() {
    const deleteObservable = this.service.clearWeek(this.idUser, this.weekStore.weekStart);
    this.loading.setLoading(true);

    deleteObservable
      .pipe(tap(() => this.loading.setLoading(false)))
      .subscribe(() => {
        this.getAllItems().subscribe((items) => this.itemsStore.setItems(items));
        this.messageService.add({
          key: 'notification',
          severity: 'success',
          detail: this.translate.instant('toast.weekCleared'),
        });
      });

    return deleteObservable;
  }

  resetData() {
    const deleteObservable = this.service.resetData(this.idUser);
    this.loading.setLoading(true);

    deleteObservable
      .pipe(tap(() => this.loading.setLoading(false)))
      .subscribe(() => {
        this.itemsStore.reset();
      });

    return deleteObservable;
  }

  cleanItems() {
    return this.itemsStore.reset();
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Item } from '../models/item';
import { ItemsService } from '../services/items.service';

@Injectable()
export class ItemsFacade {
  private _reloadMechanism = new BehaviorSubject<number>(0);

  public items$ = combineLatest([this._reloadMechanism.asObservable()]).pipe(
    switchMap(([r]) => this.service.getAllItems()),
    shareReplay(),
    startWith([])
  );
  item: any;
  items: any;

  constructor(private service: ItemsService) {}

  getAll(where: any) {
    return this.service.getAll(where).subscribe((data: any) => {
      this.items = data;
    });
  }
  getAllItems() {
    return this.service.getAllItems().subscribe((data: any) => {
      this.item = data;
    });
  }
}

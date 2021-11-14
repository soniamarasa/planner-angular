import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ItemSearchState {
  search: string;
}

@Injectable()
export class ItemSearchStore {
  private _itemSearchState = new BehaviorSubject<ItemSearchState>({
    search: '',
  });

  public readonly itemSearchState$ = this._itemSearchState.asObservable();

  setSearch(search: string) {
    const state = this._itemSearchState.value;

    this._itemSearchState.next({
      ...state,
      search,
    });
  }
}

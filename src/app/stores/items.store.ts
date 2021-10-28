import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Item } from '../models/item';

export interface ItemsState {
  items: Item[];
}

@Injectable()
export class ItemsStore {
  private _itemsState = new BehaviorSubject<ItemsState>({
    items: [],
  });

  public readonly itemsState$ = this._itemsState.asObservable();

  pushItem(item: Item) {
    const state = this._itemsState.value;
    this._itemsState.next({
      ...state,
      items: [...state.items, item],
    });
  }

  unshiftItem(item: Item) {
    const state = this._itemsState.value;
    this._itemsState.next({
      ...state,
      items: [...state.items, item],
    });
  }

  setItems(items: Item[]) {
    const state = this._itemsState.value;
    this._itemsState.next({
      ...state,
      items,
    });
  }

  replacetItem(item: Item) {
    const state = this._itemsState.value;
    const items = state.items;
    const index = items.findIndex((a) => a._id === item._id);

    items.splice(index, 1, item);

    this._itemsState.next({
      ...state,
      items,
    });
  }

  deleteItem(id: string) {
    const state = this._itemsState.value;

    this._itemsState.next({
      ...state,
      items: state.items.filter((a) => a._id !== id),
    });
  }
}

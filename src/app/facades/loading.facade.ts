import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
}

@Injectable()
export class LoadingFacade {
  private _loadingState = new BehaviorSubject<LoadingState>({
    isLoading: false,
  });

  public readonly loadingState$ = this._loadingState.asObservable();

  setLoading(isLoading: boolean) {
    const state = this._loadingState.value;

    this._loadingState.next({
      ...state,
      isLoading,
    });
  }
}

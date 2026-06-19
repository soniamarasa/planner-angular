import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export interface WeekState {
  weekStart: string;
  tick: number;
}

@Injectable()
export class WeekStore {
  private readonly stateSubject = new BehaviorSubject<WeekState>({
    weekStart: '',
    tick: 0,
  });

  readonly weekState$ = this.stateSubject.asObservable();
  readonly weekStart$ = this.weekState$.pipe(
    map((state) => state.weekStart),
    distinctUntilChanged()
  );

  setWeekStart(weekStart: string): void {
    const current = this.stateSubject.value;
    this.stateSubject.next({
      weekStart,
      tick: current.tick + 1,
    });
  }

  get weekStart(): string {
    return this.stateSubject.value.weekStart;
  }
}

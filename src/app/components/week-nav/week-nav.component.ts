import { Component } from '@angular/core';
import { map } from 'rxjs';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { WeekService } from 'src/app/services/week.service';

@Component({
  selector: 'app-week-nav',
  standalone: false,
  templateUrl: './week-nav.component.html',
  styleUrls: ['./week-nav.component.scss'],
})
export class WeekNavComponent {
  readonly weekLabel$ = this.facade.weekState$.pipe(
    map((state) => this.weekService.formatWeekRange(this.weekService.parseDateKey(state.weekStart)))
  );

  readonly isCurrentWeek$ = this.facade.weekState$.pipe(
    map((state) => this.weekService.isCurrentWeek(this.weekService.parseDateKey(state.weekStart)))
  );

  constructor(public facade: ItemsFacade, public weekService: WeekService) {}

  previousWeek(): void {
    this.facade.changeWeek(-1);
  }

  nextWeek(): void {
    this.facade.changeWeek(1);
  }

  goToToday(): void {
    this.facade.goToToday();
  }
}

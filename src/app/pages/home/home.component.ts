import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, map, Observable } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';

import { plannerDialogConfig } from 'src/app/utils/planner-dialog.util';
import { ThemeService } from '../../services/theme.service';
import { WeekService, PlannerDayColumn } from 'src/app/services/week.service';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { Item } from 'src/app/models/item';
import { FormDialogComponent } from '../../components/form-dialog/form-dialog.component';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  weekView$!: Observable<{
    dayColumns: PlannerDayColumn[];
    todayKey: string | null;
    isCurrentWeek: boolean;
  }>;

  public items$ = this.facade.itemsState$.pipe(
    map((state): Item[] => {
      return [...state.items].sort((a, b): number => {
        if (a.type && b.type) return a.type < b.type ? -1 : a.type > b.type ? 1 : 0;
        return 0;
      });
    })
  );

  constructor(
    public _dialogService: DialogService,
    private _router: Router,
    public facade: ItemsFacade,
    public weekService: WeekService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.facade.refreshItems();

    this.weekView$ = this.facade.weekState$.pipe(
      filter((state) => !!state.weekStart),
      map((state) => {
        const weekStart = this.weekService.parseDateKey(state.weekStart);
        return {
          dayColumns: this.weekService.getDayColumns(weekStart),
          todayKey: this.weekService.getTodayColumnDateKey(weekStart),
          isCurrentWeek: this.weekService.isCurrentWeek(weekStart),
        };
      })
    );
  }

  newItem() {
    this._dialogService.open(
      FormDialogComponent,
      plannerDialogConfig(this.themeService.theme, {
        header: 'New Item',
        width: '640px',
        breakpoints: {
          '960px': '90vw',
        },
      })
    );
  }

  isTodayColumn(columnDateKey: string, todayKey: string | null): boolean {
    return !!todayKey && columnDateKey === todayKey;
  }

  ngOnDestroy(): void {
    this.facade.currentId = null;
  }
}

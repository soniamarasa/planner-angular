import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DialogService } from 'primeng/dynamicdialog';

import { plannerDialogConfig } from 'src/app/utils/planner-dialog.util';
import { ThemeService } from '../../services/theme.service';
import { WeekService, PlannerDayColumn } from 'src/app/services/week.service';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { ProjectsService } from 'src/app/services/projects.service';
import { Item } from 'src/app/models/item';
import { Dropdown } from 'src/app/models/dropdown';
import { FormDialogComponent } from '../../components/form-dialog/form-dialog.component';
import { getStoredUserId } from 'src/app/utils/stored-user.util';

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

  readonly defaultProjectFilter: Dropdown[] = [{ name: 'All projects', code: '' }];
  projectFilterOptions$: Observable<Dropdown[]> = of(this.defaultProjectFilter);
  selectedProjectId = '';
  private readonly projectFilter$ = new BehaviorSubject<string>('');

  public items$ = combineLatest([this.facade.itemsState$, this.projectFilter$]).pipe(
    map(([state, projectId]): Item[] => {
      let items = [...state.items];
      if (projectId) {
        items = items.filter((item) => item.project_id === projectId);
      }
      return items.sort((a, b): number => {
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
    public themeService: ThemeService,
    private projectsService: ProjectsService
  ) {}

  ngOnInit(): void {
    this.facade.refreshItems();
    this.projectFilterOptions$ = this.buildProjectFilterOptions();

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

  onProjectFilterChange(projectId: string): void {
    this.selectedProjectId = projectId;
    this.projectFilter$.next(projectId);
  }

  newItem() {
    this._dialogService.open(
      FormDialogComponent,
      plannerDialogConfig(this.themeService.theme, {
        header: 'New item',
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

  private buildProjectFilterOptions(): Observable<Dropdown[]> {
    const userId = getStoredUserId();
    if (!userId) {
      return of(this.defaultProjectFilter);
    }

    return this.projectsService.getProjects(userId).pipe(
      map((projects) => [
        ...this.defaultProjectFilter,
        ...(projects ?? []).map((project) => ({
          name: project.name,
          code: project.id!,
        })),
      ]),
      catchError(() => of(this.defaultProjectFilter))
    );
  }
}

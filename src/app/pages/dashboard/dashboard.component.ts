import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';

import { Dropdown } from 'src/app/models/dropdown';
import { Item } from 'src/app/models/item';
import { Project } from 'src/app/models/project';
import { PomodoroSession } from 'src/app/models/focus';
import { ItemsService } from 'src/app/services/items.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { FocusService } from 'src/app/services/focus.service';
import { ThemeService } from 'src/app/services/theme.service';
import { projectIconClass } from 'src/app/utils/project-icon.util';
import { getStoredUserId } from 'src/app/utils/stored-user.util';

interface Kpi {
  icon: string;
  label: string;
  value: string;
  hint: string;
  tone: 'accent' | 'success' | 'danger' | 'info' | 'neutral';
}

interface ProjectCompletion {
  name: string;
  color: string;
  icon: string;
  total: number;
  finished: number;
  percent: number;
}

const TYPE_LABEL_KEYS: Record<string, string> = {
  task: 'typePlural.task',
  event: 'typePlural.event',
  appointment: 'typePlural.appointment',
  note: 'typePlural.note',
  tv: 'typePlural.tv',
};

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  hasData = false;

  kpis: Kpi[] = [];
  projectCompletion: ProjectCompletion[] = [];

  statusData: any = null;
  typeData: any = null;
  projectTasksData: any = null;
  focusByDayData: any = null;

  donutOptions: any = {};
  barOptions: any = {};
  lineOptions: any = {};

  rescheduledCount = 0;
  importantOpenCount = 0;
  unassignedCount = 0;
  avgFocusPerTaskLabel = '0 min';

  focusRange = 14;
  focusRangeOptions: Dropdown[];

  private items: Item[] = [];
  private projects: Project[] = [];
  private sessions: PomodoroSession[] = [];
  private readonly subs = new SubSink();

  constructor(
    private itemsService: ItemsService,
    private projectsService: ProjectsService,
    private focusService: FocusService,
    private themeService: ThemeService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.focusRangeOptions = [
      { name: this.translate.instant('dashboard.last7'), code: '7' },
      { name: this.translate.instant('dashboard.last14'), code: '14' },
      { name: this.translate.instant('dashboard.last30'), code: '30' },
    ];
  }

  ngOnInit(): void {
    const userId = getStoredUserId();
    if (!userId) {
      this.loading = false;
      return;
    }

    this.subs.add(
      forkJoin({
        items: this.itemsService
          .getAllItems(userId, undefined, true)
          .pipe(catchError(() => of([] as Item[]))),
        projects: this.projectsService
          .getProjects(userId, true)
          .pipe(catchError(() => of([] as Project[]))),
        sessions: this.focusService
          .getSessions(userId, 100)
          .pipe(catchError(() => of({ sessions: [] as PomodoroSession[] }))),
      })
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe(({ items, projects, sessions }) => {
          this.items = Array.isArray(items) ? items : [];
          this.projects = (projects ?? []).filter((project) => !project.archived);
          this.sessions = sessions?.sessions ?? [];
          this.hasData = this.items.length > 0 || this.projects.length > 0;
          this.buildAll();
        })
    );

    this.subs.add(
      this.translate.onLangChange.subscribe(() => {
        this.focusRangeOptions = [
          { name: this.translate.instant('dashboard.last7'), code: '7' },
          { name: this.translate.instant('dashboard.last14'), code: '14' },
          { name: this.translate.instant('dashboard.last30'), code: '30' },
        ];
        if (this.hasData) {
          this.buildAll();
        }
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  iconClass(icon?: string): string {
    return projectIconClass(icon);
  }

  onFocusRangeChange(value: string | number): void {
    this.focusRange = Number(value) || 14;
    this.focusByDayData = this.buildFocusByDay();
    this.cdr.markForCheck();
  }

  private buildAll(): void {
    const palette = this.palette();
    this.donutOptions = this.buildDonutOptions(palette);
    this.barOptions = this.buildBarOptions(palette);
    this.lineOptions = this.buildLineOptions(palette);

    this.buildKpis();
    this.statusData = this.buildStatusData(palette);
    this.typeData = this.buildTypeData(palette);
    this.projectTasksData = this.buildProjectTasksData(palette);
    this.focusByDayData = this.buildFocusByDay();
    this.projectCompletion = this.buildProjectCompletion();
    this.buildInsights();
  }

  private get tasks(): Item[] {
    return this.items.filter((item) => item.type === 'task');
  }

  private buildKpis(): void {
    const tasks = this.tasks;
    const total = tasks.length;
    const finished = tasks.filter((item) => item.finished).length;
    const overdue = tasks.filter((item) => item.is_overdue && !item.finished && !item.canceled).length;
    const completionRate = total > 0 ? Math.round((finished / total) * 100) : 0;

    const focusSeconds = this.items.reduce(
      (sum, item) => sum + (item.focus_seconds_total ?? 0),
      0
    );
    const pomodoros = this.items.reduce(
      (sum, item) => sum + (item.pomodoros_completed ?? 0),
      0
    );

    this.kpis = [
      {
        icon: 'pi pi-chart-pie',
        label: this.translate.instant('dashboard.kpiCompletionRate'),
        value: `${completionRate}%`,
        hint: this.translate.instant('dashboard.kpiCompletionRateHint', { finished, total }),
        tone: 'success',
      },
      {
        icon: 'pi pi-check-circle',
        label: this.translate.instant('dashboard.kpiCompleted'),
        value: `${finished}`,
        hint: this.translate.instant('dashboard.kpiCompletedHint', { count: total - finished }),
        tone: 'accent',
      },
      {
        icon: 'pi pi-exclamation-triangle',
        label: this.translate.instant('dashboard.kpiOverdue'),
        value: `${overdue}`,
        hint:
          overdue === 0
            ? this.translate.instant('dashboard.kpiOverdueHintOk')
            : this.translate.instant('dashboard.kpiOverdueHintAttention'),
        tone: overdue === 0 ? 'neutral' : 'danger',
      },
      {
        icon: 'pi pi-clock',
        label: this.translate.instant('dashboard.kpiFocusTime'),
        value: this.formatFocus(focusSeconds),
        hint: this.translate.instant('dashboard.kpiFocusTimeHint'),
        tone: 'info',
      },
      {
        icon: 'pi pi-stopwatch',
        label: this.translate.instant('dashboard.kpiPomodoros'),
        value: `${Math.round(pomodoros * 10) / 10}`,
        hint: this.translate.instant('dashboard.kpiPomodorosHint'),
        tone: 'accent',
      },
      {
        icon: 'pi pi-folder',
        label: this.translate.instant('dashboard.kpiActiveProjects'),
        value: `${this.projects.length}`,
        hint: this.translate.instant('dashboard.kpiActiveProjectsHint', {
          count: this.unassignedTasks().length,
        }),
        tone: 'info',
      },
    ];
  }

  private buildStatusData(palette: ReturnType<DashboardComponent['palette']>): any {
    const tasks = this.tasks;
    const finished = tasks.filter((item) => item.finished).length;
    const canceled = tasks.filter((item) => item.canceled && !item.finished).length;
    const started = tasks.filter(
      (item) => item.started && !item.finished && !item.canceled
    ).length;
    const notStarted = tasks.length - finished - canceled - started;

    return {
      labels: [
        this.translate.instant('dashboard.statusNotStarted'),
        this.translate.instant('dashboard.statusInProgress'),
        this.translate.instant('dashboard.statusCompleted'),
        this.translate.instant('dashboard.statusCanceled'),
      ],
      datasets: [
        {
          data: [Math.max(notStarted, 0), started, finished, canceled],
          backgroundColor: ['#8a93a3', palette.series[1], '#4AB915', '#5C5C5E'],
          hoverBackgroundColor: ['#9aa3b1', palette.series[1], '#72E938', '#7c7c7e'],
          borderWidth: 0,
        },
      ],
    };
  }

  private buildTypeData(palette: ReturnType<DashboardComponent['palette']>): any {
    const counts = new Map<string, number>();
    this.items.forEach((item) => {
      const key = item.type ?? 'task';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    const labels: string[] = [];
    const data: number[] = [];
    counts.forEach((value, key) => {
      labels.push(
        TYPE_LABEL_KEYS[key] ? this.translate.instant(TYPE_LABEL_KEYS[key]) : key
      );
      data.push(value);
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: palette.series,
          hoverBackgroundColor: palette.series,
          borderWidth: 0,
        },
      ],
    };
  }

  private buildProjectTasksData(palette: ReturnType<DashboardComponent['palette']>): any {
    const ranked = [...this.projects]
      .sort((a, b) => (b.open_tasks_count ?? 0) - (a.open_tasks_count ?? 0))
      .slice(0, 8);

    return {
      labels: ranked.map((project) => project.name),
      datasets: [
        {
          label: this.translate.instant('dashboard.openTasks'),
          data: ranked.map((project) => project.open_tasks_count ?? 0),
          backgroundColor: ranked.map(
            (project) => project.color || palette.accent
          ),
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 34,
        },
      ],
    };
  }

  private buildFocusByDay(): any {
    const palette = this.palette();
    const days = this.focusRange;
    const buckets = new Map<string, number>();
    const labels: string[] = [];
    const keys: string[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = this.dateKey(date);
      keys.push(key);
      buckets.set(key, 0);
      labels.push(
        date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' })
      );
    }

    this.sessions.forEach((session) => {
      const stamp = session.ended_at || session.started_at;
      if (!stamp) {
        return;
      }
      const date = new Date(stamp);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      date.setHours(0, 0, 0, 0);
      const key = this.dateKey(date);
      if (buckets.has(key)) {
        const minutes = (session.credited_seconds ?? 0) / 60;
        buckets.set(key, (buckets.get(key) ?? 0) + minutes);
      }
    });

    const data = keys.map((key) => Math.round(buckets.get(key) ?? 0));

    return {
      labels,
      datasets: [
        {
          label: this.translate.instant('dashboard.focusMinutes'),
          data,
          fill: true,
          tension: 0.4,
          borderColor: palette.accent,
          backgroundColor: this.hexToRgba(palette.accent, 0.18),
          pointBackgroundColor: palette.accent,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
        },
      ],
    };
  }

  private buildProjectCompletion(): ProjectCompletion[] {
    return this.projects
      .map((project) => {
        const projectTasks = this.items.filter(
          (item) => item.type === 'task' && item.project_id === project.id
        );
        const total = projectTasks.length;
        const finished = projectTasks.filter((item) => item.finished).length;
        const percent = total > 0 ? Math.round((finished / total) * 100) : 0;
        return {
          name: project.name,
          color: project.color || '#ff9a3d',
          icon: project.icon || 'pi-briefcase',
          total,
          finished,
          percent,
        };
      })
      .filter((entry) => entry.total > 0)
      .sort((a, b) => b.percent - a.percent);
  }

  private buildInsights(): void {
    const tasks = this.tasks;
    this.rescheduledCount = tasks.filter((item) => !!item.carried_from).length;
    this.importantOpenCount = tasks.filter(
      (item) => item.important && !item.finished && !item.canceled
    ).length;
    this.unassignedCount = this.unassignedTasks().length;

    const focusSeconds = this.items.reduce(
      (sum, item) => sum + (item.focus_seconds_total ?? 0),
      0
    );
    const focusedTasks = this.items.filter(
      (item) => (item.focus_seconds_total ?? 0) > 0
    ).length;
    const avg = focusedTasks > 0 ? focusSeconds / focusedTasks : 0;
    this.avgFocusPerTaskLabel = this.formatFocus(avg);
  }

  private unassignedTasks(): Item[] {
    return this.items.filter((item) => item.type === 'task' && !item.project_id);
  }

  private palette() {
    const dark = this.themeService.theme === 'theme-dark';
    return {
      text: dark ? '#b3b7c0' : '#6f7c91',
      title: dark ? '#f2f3f5' : '#243041',
      grid: dark ? 'rgba(255,255,255,0.07)' : 'rgba(87,105,137,0.12)',
      accent: dark ? '#d7a463' : '#ff9a3d',
      series: [
        '#ff9a3d',
        '#6f8cff',
        '#4AB915',
        '#f52d55',
        '#b995b9',
        '#28c2b8',
        '#f5b73d',
      ],
    };
  }

  private buildDonutOptions(palette: ReturnType<DashboardComponent['palette']>): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '64%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: palette.text,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 14,
            font: { family: 'Itim' },
          },
        },
      },
    };
  }

  private buildBarOptions(palette: ReturnType<DashboardComponent['palette']>): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: { color: palette.text, font: { family: 'Itim' } },
          grid: { color: palette.grid, drawBorder: false },
        },
        y: {
          beginAtZero: true,
          ticks: { color: palette.text, precision: 0, font: { family: 'Itim' } },
          grid: { color: palette.grid, drawBorder: false },
        },
      },
    };
  }

  private buildLineOptions(palette: ReturnType<DashboardComponent['palette']>): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) =>
              `${context.parsed.y} ${this.translate.instant('dashboard.minShort')}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: palette.text, font: { family: 'Itim' }, maxRotation: 0 },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { color: palette.text, font: { family: 'Itim' } },
          grid: { color: palette.grid, drawBorder: false },
        },
      },
    };
  }

  private formatFocus(seconds: number): string {
    const total = Math.round(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (hours > 0) {
      return `${hours}${this.translate.instant('dashboard.hourShort')} ${minutes}${this.translate.instant('dashboard.minShortTight')}`;
    }
    return `${minutes} ${this.translate.instant('dashboard.minShort')}`;
  }

  private dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace('#', '');
    const bigint = parseInt(
      normalized.length === 3
        ? normalized
            .split('')
            .map((c) => c + c)
            .join('')
        : normalized,
      16
    );
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

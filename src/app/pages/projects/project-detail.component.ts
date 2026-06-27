import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { finalize } from 'rxjs/operators';

import { ProjectFormDialogComponent } from 'src/app/components/project-form-dialog/project-form-dialog.component';
import { FormDialogComponent } from 'src/app/components/form-dialog/form-dialog.component';
import { EditFormComponent } from 'src/app/components/edit-form/edit-form.component';
import { Item } from 'src/app/models/item';
import { Project } from 'src/app/models/project';
import { ProjectsService } from 'src/app/services/projects.service';
import { ProjectsHubService } from 'src/app/services/projects-hub.service';
import { ThemeService } from 'src/app/services/theme.service';
import { WeekService } from 'src/app/services/week.service';
import { plannerDialogConfig } from 'src/app/utils/planner-dialog.util';
import { projectIconClass } from 'src/app/utils/project-icon.util';
import { getStoredUserId } from 'src/app/utils/stored-user.util';

interface ProjectSection {
  key: string;
  title: string;
  items: Item[];
}

@Component({
  selector: 'app-project-detail',
  standalone: false,
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  project: Project | null = null;
  sections: ProjectSection[] = [];
  loading = true;
  isUnassigned = false;
  pageTitle = '';
  private userId = '';
  private projectId = '';
  private readonly subs = new SubSink();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private projectsHub: ProjectsHubService,
    private weekService: WeekService,
    private dialogService: DialogService,
    private themeService: ThemeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.pageTitle = this.translate.instant('projects.defaultName');
    this.userId = getStoredUserId();
    this.subs.add(
      this.route.paramMap.subscribe((params) => {
        this.projectId = params.get('id') ?? '';
        this.isUnassigned = this.projectId === 'unassigned';
        this.loadProject();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  iconClass(icon?: string): string {
    return projectIconClass(icon);
  }

  formatFocus(seconds = 0): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  backToList(): void {
    void this.router.navigate(['/projects']);
  }

  formatDate(value?: string | null): string {
    if (!value) {
      return '';
    }
    return this.weekService.parseDateKey(value).toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  openItem(item: Item): void {
    const ref = this.dialogService.open(
      EditFormComponent,
      plannerDialogConfig(this.themeService.theme, {
        header: this.translate.instant('projects.editItem'),
        width: '640px',
        breakpoints: {
          '960px': '90vw',
        },
        data: item,
      })
    );

    this.subs.add(ref?.onClose.subscribe(() => this.loadProject()));
  }

  openAddTask(): void {
    const ref = this.dialogService.open(
      FormDialogComponent,
      plannerDialogConfig(this.themeService.theme, {
        header: this.translate.instant('projects.newTask'),
        width: '640px',
        breakpoints: { '960px': '90vw' },
        data: {
          projectId: this.isUnassigned ? '' : this.projectId,
        },
      })
    );

    this.subs.add(ref?.onClose.subscribe(() => this.loadProject()));
  }

  openEditDialog(): void {
    if (!this.project) {
      return;
    }

    const ref = this.dialogService.open(
      ProjectFormDialogComponent,
      plannerDialogConfig(this.themeService.theme, {
        header: this.translate.instant('projects.editProject'),
        width: '420px',
        data: { project: this.project },
      })
    );

    this.subs.add(
      ref?.onClose.subscribe((payload) => {
        if (!payload || !this.project?.id) {
          return;
        }
        this.subs.add(
          this.projectsService.updateProject(this.userId, this.project.id, payload).subscribe({
            next: (updated) => {
              this.project = updated;
              this.pageTitle = updated.name;
            },
            error: () =>
              this.messageService.add({
                key: 'notification',
                severity: 'error',
                detail: this.translate.instant('projects.updateError'),
              }),
          })
        );
      })
    );
  }

  archiveProject(): void {
    if (!this.project?.id) {
      return;
    }

    this.confirmationService.confirm({
      message: this.translate.instant('projects.archiveMessage'),
      header: this.translate.instant('projects.archiveHeader'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.subs.add(
          this.projectsService
            .updateProject(this.userId, this.project!.id!, { archived: true })
            .subscribe({
              next: () => void this.router.navigate(['/projects']),
              error: () =>
                this.messageService.add({
                  key: 'notification',
                  severity: 'error',
                  detail: this.translate.instant('projects.archiveError'),
                }),
            })
        );
      },
    });
  }

  private loadProject(): void {
    this.userId = getStoredUserId();

    if (!this.userId) {
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    if (this.isUnassigned) {
      this.project = null;
      this.pageTitle = this.translate.instant('projects.noProject');
      this.subs.add(
        this.projectsService
          .getUnassignedItems(this.userId)
          .pipe(
            finalize(() => {
              this.loading = false;
              this.cdr.markForCheck();
            })
          )
          .subscribe({
            next: (items) => {
              this.sections = this.buildSections(items ?? []);
              this.projectsHub.notifyTasksChanged();
            },
            error: () => this.handleLoadError(),
          })
      );
      return;
    }

    this.subs.add(
      this.projectsService
        .getProjectItems(this.userId, this.projectId)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (items) => {
            const projectItems = items ?? [];
            const meta = projectItems.find((item) => item.project_name);
            this.project = {
              id: this.projectId,
              name: meta?.project_name ?? this.translate.instant('projects.defaultName'),
              icon: meta?.project_icon ?? 'pi-briefcase',
              color: meta?.project_color ?? '#ff9a3d',
            };
            this.pageTitle = this.project.name;
            this.sections = this.buildSections(projectItems);
            this.projectsHub.notifyTasksChanged();
          },
          error: () => this.handleLoadError(),
        })
    );

    this.subs.add(
      this.projectsService.getProjects(this.userId, true).subscribe({
        next: (projects) => {
          const match = (projects ?? []).find((entry) => entry.id === this.projectId);
          if (match) {
            this.project = match;
            this.pageTitle = match.name;
          }
        },
      })
    );
  }

  private handleLoadError(): void {
    this.loading = false;
    this.cdr.markForCheck();
    this.messageService.add({
      key: 'notification',
      severity: 'error',
      detail: this.translate.instant('projects.loadOneError'),
    });
  }

  private buildSections(items: Item[]): ProjectSection[] {
    const weekStartDate = this.weekService.getWeekStart(new Date());
    const weekStart = this.weekService.toDateKey(weekStartDate);
    const weekEnd = this.weekService.toDateKey(this.weekService.getWeekEnd(weekStartDate));

    const open = items.filter((item) => !item.finished && !item.canceled);
    const finished = items.filter((item) => item.finished);

    const overdue = open.filter((item) => item.is_overdue);
    const thisWeek = open.filter((item) => {
      if (!item.scheduled_date || item.is_overdue) {
        return false;
      }
      return item.scheduled_date >= weekStart && item.scheduled_date <= weekEnd;
    });
    const noDate = open.filter((item) => !item.scheduled_date && !item.is_overdue);
    const later = open.filter((item) => {
      if (!item.scheduled_date || item.is_overdue) {
        return false;
      }
      return item.scheduled_date > weekEnd;
    });

    const sections: ProjectSection[] = [
      { key: 'overdue', title: 'section.overdue', items: overdue },
      { key: 'week', title: 'section.week', items: thisWeek },
      { key: 'later', title: 'section.later', items: later },
      { key: 'nodate', title: 'section.nodate', items: noDate },
      { key: 'done', title: 'section.done', items: finished },
    ];

    return sections.filter((section) => section.items.length > 0);
  }
}

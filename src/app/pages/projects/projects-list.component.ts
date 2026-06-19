import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { SubSink } from 'subsink';
import { finalize } from 'rxjs/operators';

import { ProjectFormDialogComponent } from 'src/app/components/project-form-dialog/project-form-dialog.component';
import { Project } from 'src/app/models/project';
import { ProjectsService } from 'src/app/services/projects.service';
import { ThemeService } from 'src/app/services/theme.service';
import { plannerDialogConfig } from 'src/app/utils/planner-dialog.util';
import { projectIconClass } from 'src/app/utils/project-icon.util';
import { getStoredUserId } from 'src/app/utils/stored-user.util';

@Component({
  selector: 'app-projects-list',
  standalone: false,
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss'],
})
export class ProjectsListComponent implements OnInit, OnDestroy {
  @Output() ready = new EventEmitter<{
    projects: Project[];
    unassignedCount: number;
  }>();
  @Output() listChanged = new EventEmitter<void>();

  projects: Project[] = [];
  archivedProjects: Project[] = [];
  unassignedCount = 0;
  loading = true;
  showArchived = false;
  private userId = '';
  private readonly subs = new SubSink();

  constructor(
    private projectsService: ProjectsService,
    private dialogService: DialogService,
    private themeService: ThemeService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = getStoredUserId();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  iconClass(icon: string): string {
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

  toggleArchived(): void {
    this.showArchived = !this.showArchived;
    if (this.showArchived && this.archivedProjects.length === 0) {
      this.loadArchived();
    }
  }

  openCreateDialog(): void {
    if (!this.userId) {
      return;
    }

    const ref = this.dialogService.open(
      ProjectFormDialogComponent,
      plannerDialogConfig(this.themeService.theme, {
        header: 'Novo projeto',
        width: '420px',
      })
    );

    this.subs.add(
      ref?.onClose.subscribe((payload) => {
        if (!payload) {
          return;
        }
        this.subs.add(
          this.projectsService.createProject(this.userId, payload).subscribe({
            next: () => this.loadData(),
            error: () =>
              this.messageService.add({
                key: 'notification',
                severity: 'error',
                detail: 'Não foi possível criar o projeto.',
              }),
          })
        );
      })
    );
  }

  reload(): void {
    this.loadData();
  }

  restoreProject(project: Project): void {
    if (!project.id) {
      return;
    }

    this.subs.add(
      this.projectsService.updateProject(this.userId, project.id, { archived: false }).subscribe({
        next: () => {
          this.loadData();
          if (this.showArchived) {
            this.loadArchived();
          }
          this.messageService.add({
            key: 'notification',
            severity: 'success',
            detail: 'Projeto restaurado.',
          });
        },
        error: () =>
          this.messageService.add({
            key: 'notification',
            severity: 'error',
            detail: 'Não foi possível restaurar o projeto.',
          }),
      })
    );
  }

  private loadData(): void {
    this.userId = getStoredUserId();

    if (!this.userId) {
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    let projectsLoaded = false;
    let summaryLoaded = false;

    const emitReadyIfDone = () => {
      if (!projectsLoaded || !summaryLoaded) {
        return;
      }
      this.ready.emit({
        projects: this.projects,
        unassignedCount: this.unassignedCount,
      });
      this.listChanged.emit();
    };

    this.subs.add(
      this.projectsService
        .getProjects(this.userId)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (projects) => {
            this.projects = (projects ?? []).filter((project) => !project.archived);
            projectsLoaded = true;
            emitReadyIfDone();
          },
          error: () => {
            this.projects = [];
            projectsLoaded = true;
            emitReadyIfDone();
            this.messageService.add({
              key: 'notification',
              severity: 'error',
              detail: 'Não foi possível carregar os projetos.',
            });
          },
        })
    );

    this.subs.add(
      this.projectsService.getUnassignedSummary(this.userId).subscribe({
        next: (summary) => {
          this.unassignedCount = summary?.open_count ?? 0;
          summaryLoaded = true;
          emitReadyIfDone();
          this.cdr.markForCheck();
        },
        error: () => {
          this.unassignedCount = 0;
          summaryLoaded = true;
          emitReadyIfDone();
        },
      })
    );
  }

  private loadArchived(): void {
    this.subs.add(
      this.projectsService.getProjects(this.userId, true).subscribe({
        next: (projects) => {
          this.archivedProjects = (projects ?? []).filter((project) => project.archived);
          this.cdr.markForCheck();
        },
      })
    );
  }
}

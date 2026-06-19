import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SubSink } from 'subsink';

import { ProjectsListComponent } from './projects-list.component';
import { ProjectsHubService } from 'src/app/services/projects-hub.service';

@Component({
  selector: 'app-projects-shell',
  standalone: false,
  templateUrl: './projects-shell.component.html',
  styleUrls: ['./projects-shell.component.scss'],
})
export class ProjectsShellComponent implements OnInit, OnDestroy {
  @ViewChild(ProjectsListComponent) sidebar?: ProjectsListComponent;

  detailOpen = false;
  private readonly subs = new SubSink();

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private projectsHub: ProjectsHubService
  ) {}

  ngOnInit(): void {
    this.updateDetailOpen();

    this.subs.add(
      this.projectsHub.onTasksChanged$.subscribe(() => {
        this.sidebar?.reload();
      })
    );

    this.subs.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          this.updateDetailOpen();
          const url = this.router.url.split('?')[0];
          if (url === '/projects') {
            this.sidebar?.reload();
          }
          this.cdr.markForCheck();
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onSidebarReady(event: {
    projects: { id?: string }[];
    unassignedCount: number;
  }): void {
    const url = this.router.url.split('?')[0];
    if (url !== '/projects') {
      return;
    }

    if (event.projects.length > 0 && event.projects[0].id) {
      void this.router.navigate(['/projects', event.projects[0].id], {
        replaceUrl: true,
      });
      return;
    }

    if (event.unassignedCount > 0) {
      void this.router.navigate(['/projects', 'unassigned'], {
        replaceUrl: true,
      });
    }
  }

  onSidebarRefresh(): void {
    this.cdr.markForCheck();
  }

  private updateDetailOpen(): void {
    const url = this.router.url.split('?')[0];
    this.detailOpen = url.startsWith('/projects/') && url !== '/projects';
  }
}

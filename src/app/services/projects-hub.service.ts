import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectsHubService {
  private readonly tasksChanged$ = new Subject<void>();

  readonly onTasksChanged$ = this.tasksChanged$.asObservable();

  notifyTasksChanged(): void {
    this.tasksChanged$.next();
  }
}

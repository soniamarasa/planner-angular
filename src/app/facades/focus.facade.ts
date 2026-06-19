import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, forkJoin, interval, of } from 'rxjs';
import { catchError, finalize, take, takeUntil, tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { FocusService } from '../services/focus.service';
import { AmbientSoundService } from '../services/ambient-sound.service';
import { ItemsService } from '../services/items.service';
import { ItemsStore } from '../stores/items.store';
import { FocusSettings, FocusSettingsUpdate, PomodoroSession } from '../models/focus';
import { Item } from '../models/item';

export interface FocusState {
  settings: FocusSettings | null;
  session: PomodoroSession | null;
  tasks: Item[];
  selectedTask: Item | null;
  elapsedSeconds: number;
  remainingSeconds: number;
  cycleProgress: number;
  isRunning: boolean;
  loading: boolean;
}

const initialState: FocusState = {
  settings: null,
  session: null,
  tasks: [],
  selectedTask: null,
  elapsedSeconds: 0,
  remainingSeconds: 0,
  cycleProgress: 0,
  isRunning: false,
  loading: false,
};

@Injectable()
export class FocusFacade implements OnDestroy {
  private readonly stateSubject = new BehaviorSubject<FocusState>(initialState);
  readonly state$ = this.stateSubject.asObservable();

  private readonly destroy$ = new Subject<void>();
  private readonly stopTimer$ = new Subject<void>();

  private userId = '';
  private tickStartedAt = 0;
  private tickBaseElapsed = 0;
  private syncIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private focusService: FocusService,
    private ambientSound: AmbientSoundService,
    private itemsService: ItemsService,
    private itemsStore: ItemsStore,
    private messageService: MessageService
  ) {}

  ngOnDestroy(): void {
    this.stopLocalTimer();
    this.ambientSound.stop();
    this.destroy$.next();
    this.destroy$.complete();
  }

  init(taskId?: string | null): void {
    this.userId = JSON.parse(localStorage.getItem('idUser') as string);
    this.patchState({ loading: true });

    forkJoin({
      items: this.itemsService.getAllItems(this.userId, undefined, true).pipe(
        take(1),
        catchError(() => of([] as Item[]))
      ),
      settings: this.focusService.getSettings(this.userId).pipe(
        take(1),
        catchError(() => of(null as FocusSettings | null))
      ),
      session: this.focusService.getActiveSession(this.userId).pipe(
        take(1),
        catchError(() => of(null))
      ),
    })
      .pipe(finalize(() => this.patchState({ loading: false })))
      .subscribe({
        next: ({ items, settings, session }) => {
          try {
            const safeItems = Array.isArray(items) ? items : [];
            const tasks = safeItems.filter(
              (item) => item.type === 'task' && !item.finished && !item.canceled
            );
            const selectedTask =
              tasks.find((task) => task.id === taskId) ??
              (session ? tasks.find((task) => task.id === session.item_id) : null) ??
              tasks[0] ??
              null;

            this.itemsStore.setItems(safeItems);
            this.patchState({ tasks, selectedTask, settings });

            if (settings) {
              this.applyAmbientSound(settings);
            }

            if (session) {
              this.applySession(session, selectedTask, session.status === 'running');
            }
          } catch (error) {
            console.error('Failed to initialize focus mode', error);
            this.messageService.add({
              key: 'notification',
              severity: 'error',
              detail: 'Failed to load focus mode.',
            });
          }
        },
        error: () => {
          this.messageService.add({
            key: 'notification',
            severity: 'error',
            detail: 'Failed to load focus mode.',
          });
        },
      });
  }

  selectTask(task: Item): void {
    this.patchState({ selectedTask: task });
  }

  startSession(): void {
    const { selectedTask, session, isRunning } = this.stateSubject.value;
    if (!selectedTask?.id || isRunning) {
      return;
    }

    if (session && (session.status === 'running' || session.status === 'paused')) {
      this.messageService.add({
        key: 'notification',
        severity: 'warn',
        detail: 'Finish or abandon the current session before starting another.',
      });
      return;
    }

    this.patchState({ loading: true });
    this.focusService.startSession(this.userId, { item_id: selectedTask.id }).subscribe({
      next: (newSession) => {
        this.applySession(newSession, selectedTask, true);
        this.patchState({ loading: false });
        this.applyAmbientSound(this.stateSubject.value.settings);
        this.messageService.add({
          key: 'notification',
          severity: 'success',
          detail: 'Focus session started.',
        });
      },
      error: () => this.patchState({ loading: false }),
    });
  }

  pauseSession(): void {
    const { session } = this.stateSubject.value;
    if (!session || session.status !== 'running') {
      return;
    }

    const elapsedSeconds = this.getCurrentElapsed();
    this.stopLocalTimer();
    this.patchState({ loading: true });

    this.focusService.pauseSession(this.userId, session.id, { elapsed_seconds: elapsedSeconds }).subscribe({
      next: (updatedSession) => {
        this.applySession(updatedSession, this.stateSubject.value.selectedTask, false);
        this.patchState({ loading: false });
      },
      error: () => this.patchState({ loading: false }),
    });
  }

  resumeSession(): void {
    const { session } = this.stateSubject.value;
    if (!session || session.status !== 'paused') {
      return;
    }

    this.patchState({ loading: true });
    this.focusService.resumeSession(this.userId, session.id).subscribe({
      next: (updatedSession) => {
        this.applySession(updatedSession, this.stateSubject.value.selectedTask, true);
        this.patchState({ loading: false });
        this.applyAmbientSound(this.stateSubject.value.settings);
      },
      error: () => this.patchState({ loading: false }),
    });
  }

  completeSession(): void {
    const { session } = this.stateSubject.value;
    if (!session) {
      return;
    }

    const elapsedSeconds = session.status === 'running'
      ? this.getCurrentElapsed()
      : session.elapsed_seconds;

    this.stopLocalTimer();
    this.patchState({ loading: true });

    this.focusService
      .completeSession(this.userId, session.id, { elapsed_seconds: elapsedSeconds })
      .subscribe({
        next: (updatedSession) => {
        this.handleSessionFinished(updatedSession);
        this.notifyIfEnabled();
        this.messageService.add({
            key: 'notification',
            severity: 'success',
            detail: 'Pomodoro completed!',
          });
        },
        error: () => this.patchState({ loading: false }),
      });
  }

  abandonSession(creditPartial = true): void {
    const { session } = this.stateSubject.value;
    if (!session) {
      return;
    }

    const elapsedSeconds = session.status === 'running'
      ? this.getCurrentElapsed()
      : session.elapsed_seconds;

    this.stopLocalTimer();
    this.patchState({ loading: true });

    this.focusService
      .abandonSession(this.userId, session.id, {
        elapsed_seconds: elapsedSeconds,
        credit_partial: creditPartial,
      })
      .subscribe({
        next: (updatedSession) => {
          this.handleSessionFinished(updatedSession);
        },
        error: () => this.patchState({ loading: false }),
      });
  }

  updateTask(task: Item): Observable<Item> {
    return this.itemsService.editItem(this.userId, task.id!, task).pipe(
      tap((updatedTask) => {
        this.itemsStore.replacetItem(updatedTask);
        const tasks = this.stateSubject.value.tasks.map((current) =>
          current.id === updatedTask.id ? updatedTask : current
        );
        this.patchState({
          tasks,
          selectedTask:
            this.stateSubject.value.selectedTask?.id === updatedTask.id
              ? updatedTask
              : this.stateSubject.value.selectedTask,
        });
      })
    );
  }

  saveSettings(payload: FocusSettingsUpdate, options?: { silent?: boolean }): void {
    this.focusService.updateSettings(this.userId, payload).subscribe({
      next: (settings) => {
        this.patchState({ settings });
        this.applyAmbientSound(settings);
        if (!options?.silent) {
          this.messageService.add({
            key: 'notification',
            severity: 'success',
            detail: 'Focus settings updated.',
          });
        }
      },
      error: () => {
        this.messageService.add({
          key: 'notification',
          severity: 'error',
          detail: 'Failed to update focus settings.',
        });
      },
    });
  }

  syncBeforeUnload(): void {
    const { session, isRunning } = this.stateSubject.value;
    if (!session || !isRunning) {
      return;
    }

    const elapsedSeconds = this.getCurrentElapsed();
    this.focusService
      .syncSession(this.userId, session.id, { elapsed_seconds: elapsedSeconds })
      .subscribe();
  }

  cleanup(): void {
    const { session, isRunning } = this.stateSubject.value;
    if (session && isRunning) {
      this.pauseSession();
    } else {
      this.stopLocalTimer();
      this.ambientSound.stop();
      this.patchState({ loading: false });
    }
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  private applySession(
    session: PomodoroSession,
    selectedTask: Item | null,
    isRunning: boolean
  ): void {
    this.stopLocalTimer();
    this.updateItemFromSession(session);

    const elapsedSeconds = session.elapsed_seconds;
    const remainingSeconds = Math.max(session.target_seconds - elapsedSeconds, 0);
    const cycleProgress = session.target_seconds
      ? elapsedSeconds / session.target_seconds
      : 0;

    this.patchState({
      session,
      selectedTask: selectedTask ?? this.stateSubject.value.selectedTask,
      elapsedSeconds,
      remainingSeconds,
      cycleProgress,
      isRunning,
    });

    if (isRunning) {
      this.startLocalTimer(elapsedSeconds, session.target_seconds);
    }
  }

  private handleSessionFinished(session: PomodoroSession): void {
    this.stopLocalTimer();
    this.updateItemFromSession(session);
    this.patchState({
      session: null,
      elapsedSeconds: 0,
      remainingSeconds: session.target_seconds,
      cycleProgress: 0,
      isRunning: false,
      loading: false,
    });
  }

  private updateItemFromSession(session: PomodoroSession): void {
    const tasks = this.stateSubject.value.tasks.map((task) => {
      if (task.id !== session.item_id) {
        return task;
      }

      const pomodoroSeconds = session.target_seconds || 1;
      const estimatedPomodoros = Math.max(session.item_estimated_pomodoros || 1, 0.1);
      return {
        ...task,
        focus_seconds_total: session.item_focus_seconds_total,
        estimated_pomodoros: session.item_estimated_pomodoros,
        pomodoros_completed: session.item_pomodoros_completed,
        task_focus_progress: Math.min(
          session.item_focus_seconds_total / (estimatedPomodoros * pomodoroSeconds),
          1
        ),
        started: true,
      };
    });

    const selectedTask = tasks.find((task) => task.id === session.item_id) ?? null;
    this.patchState({ tasks, selectedTask });

    if (selectedTask) {
      this.itemsStore.replacetItem(selectedTask);
    }
  }

  private startLocalTimer(baseElapsed: number, targetSeconds: number): void {
    this.tickBaseElapsed = baseElapsed;
    this.tickStartedAt = Date.now();
    this.stopTimer$.next();

    interval(1000)
      .pipe(takeUntil(this.stopTimer$), takeUntil(this.destroy$))
      .subscribe(() => {
        const elapsedSeconds = Math.min(this.getCurrentElapsed(), targetSeconds);
        const remainingSeconds = Math.max(targetSeconds - elapsedSeconds, 0);
        const cycleProgress = targetSeconds ? elapsedSeconds / targetSeconds : 0;

        this.patchState({ elapsedSeconds, remainingSeconds, cycleProgress });

        if (elapsedSeconds >= targetSeconds) {
          this.completeSession();
        }
      });

    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = setInterval(() => {
      const { session, isRunning } = this.stateSubject.value;
      if (!session || !isRunning) {
        return;
      }

      this.focusService
        .syncSession(this.userId, session.id, {
          elapsed_seconds: this.getCurrentElapsed(),
        })
        .subscribe({
          next: (updatedSession) => this.updateItemFromSession(updatedSession),
        });
    }, 15000);
  }

  private stopLocalTimer(): void {
    this.stopTimer$.next();
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  private getCurrentElapsed(): number {
    if (!this.stateSubject.value.isRunning) {
      return this.stateSubject.value.elapsedSeconds;
    }

    const delta = Math.floor((Date.now() - this.tickStartedAt) / 1000);
    return this.tickBaseElapsed + delta;
  }

  private applyAmbientSound(settings: FocusSettings | null): void {
    try {
      if (!settings || settings.ambient_sound === 'none') {
        this.ambientSound.stop();
        return;
      }

      if (
        this.stateSubject.value.isRunning ||
        this.stateSubject.value.session?.status === 'paused'
      ) {
        this.ambientSound.start(settings.ambient_sound, settings.sound_volume);
      }
    } catch (error) {
      console.warn('Unable to start ambient sound', error);
    }
  }

  private patchState(partial: Partial<FocusState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partial,
    });
  }

  private notifyIfEnabled(): void {
    const settings = this.stateSubject.value.settings;
    if (!settings?.notify_on_complete || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('Pomodoro completed!', {
        body: 'Great job. Time for a break.',
      });
      return;
    }

    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Pomodoro completed!', {
            body: 'Great job. Time for a break.',
          });
        }
      });
    }
  }
}

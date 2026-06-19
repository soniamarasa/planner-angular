import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';
import { Dropdown } from 'src/app/models/dropdown';
import { FocusSettingsUpdate } from 'src/app/models/focus';
import { Item } from 'src/app/models/item';
import { FocusFacade, FocusState } from 'src/app/facades/focus.facade';
import {
  FOCUS_BACKGROUNDS,
  FocusBackground,
  getFocusBackgroundById,
} from 'src/app/config/focus-backgrounds';

@Component({
  selector: 'app-focus',
  standalone: false,
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.scss'],
})
export class FocusComponent implements OnInit, OnDestroy {
  state: FocusState | null = null;
  taskForm!: FormGroup;
  settingsForm!: FormGroup;
  settingsVisible = false;
  readonly backgrounds: FocusBackground[] = FOCUS_BACKGROUNDS;

  soundOptions: Dropdown[] = [
    { name: 'Rain', code: 'rain' },
    { name: 'White noise', code: 'white' },
    { name: 'Cafe', code: 'cafe' },
    { name: 'Silence', code: 'none' },
  ];

  private subs = new SubSink();

  constructor(
    public focusFacade: FocusFacade,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.taskForm = this.formBuilder.group({
      description: ['', Validators.required],
      obs: [''],
      where: ['', Validators.required],
      estimated_pomodoros: [1, [Validators.required, Validators.min(0.1)]],
    });

    this.settingsForm = this.formBuilder.group({
      work_minutes: [25, [Validators.required, Validators.min(1)]],
      short_break_minutes: [5, [Validators.required, Validators.min(1)]],
      long_break_minutes: [15, [Validators.required, Validators.min(1)]],
      long_break_interval: [4, [Validators.required, Validators.min(1)]],
      ambient_sound: ['rain', Validators.required],
      sound_volume: [0.5, [Validators.required, Validators.min(0), Validators.max(1)]],
      background_id: ['forest', Validators.required],
      auto_start_breaks: [false],
      auto_start_focus: [false],
      notify_on_complete: [true],
    });
  }

  ngOnInit(): void {
    this.subs.add(
      this.focusFacade.state$.subscribe((state) => {
        this.state = state;
        if (state.selectedTask) {
          this.patchTaskForm(state.selectedTask);
        }
        if (state.settings && !this.settingsVisible) {
          this.settingsForm.patchValue(state.settings, { emitEvent: false });
        }
        this.cdr.markForCheck();
      })
    );

    this.focusFacade.init(this.route.snapshot.queryParamMap.get('taskId'));
  }

  ngOnDestroy(): void {
    this.focusFacade.cleanup();
    this.subs.unsubscribe();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.focusFacade.syncBeforeUnload();
  }

  get backgroundStyle(): Record<string, string> {
    const background = getFocusBackgroundById(this.state?.settings?.background_id);
    return {
      backgroundImage: `linear-gradient(rgba(8, 12, 22, 0.45), rgba(8, 12, 22, 0.55)), url('${background.imageUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }

  get activeBackgroundCredit(): string {
    return getFocusBackgroundById(this.state?.settings?.background_id).credit.trim();
  }

  selectBackground(backgroundId: string): void {
    this.settingsForm.patchValue({ background_id: backgroundId }, { emitEvent: false });
    this.focusFacade.saveSettings({ background_id: backgroundId }, { silent: true });
  }

  get timerDisplay(): string {
    if (!this.state) {
      return '25:00';
    }
    return this.focusFacade.formatTime(this.state.remainingSeconds);
  }

  get progressDegrees(): number {
    return (this.state?.cycleProgress ?? 0) * 360;
  }

  get sessionStatusLabel(): string {
    if (!this.state?.session) {
      return 'Ready to focus';
    }
    if (this.state.isRunning) {
      return 'Focusing';
    }
    if (this.state.session.status === 'paused') {
      return 'Paused';
    }
    return 'Ready to focus';
  }

  selectTask(task: Item): void {
    this.focusFacade.selectTask(task);
  }

  startSession(): void {
    this.focusFacade.startSession();
  }

  pauseSession(): void {
    this.focusFacade.pauseSession();
  }

  resumeSession(): void {
    this.focusFacade.resumeSession();
  }

  completeSession(): void {
    this.focusFacade.completeSession();
  }

  abandonSession(): void {
    this.focusFacade.abandonSession(true);
  }

  saveTask(): void {
    if (!this.state?.selectedTask?.id || this.taskForm.invalid) {
      return;
    }

    const payload: Item = {
      ...this.state.selectedTask,
      ...this.taskForm.value,
    };

    this.subs.add(
      this.focusFacade.updateTask(payload).subscribe({
        next: () => {
          this.focusFacade.selectTask(payload);
        },
      })
    );
  }

  openSettings(): void {
    if (this.state?.settings) {
      this.settingsForm.patchValue(this.state.settings, { emitEvent: false });
    }
    this.settingsVisible = true;
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    this.focusFacade.saveSettings(this.settingsForm.value as FocusSettingsUpdate);
    this.settingsVisible = false;
  }

  onVolumeChange(): void {
    if (!this.settingsVisible) {
      return;
    }
    const volume = this.settingsForm.get('sound_volume')?.value ?? 0.5;
    this.focusFacade.saveSettings({ sound_volume: volume }, { silent: true });
  }

  onSoundChange(): void {
    if (!this.settingsVisible) {
      return;
    }
    const ambient_sound = this.settingsForm.get('ambient_sound')?.value ?? 'rain';
    this.focusFacade.saveSettings({ ambient_sound }, { silent: true });
  }

  taskProgressLabel(task: Item): string {
    const completed = task.pomodoros_completed ?? 0;
    const estimated = task.estimated_pomodoros ?? 1;
    return `${completed.toFixed(1)} / ${estimated} pomodoros`;
  }

  taskProgressPercent(task: Item): number {
    return Math.round((task.task_focus_progress ?? 0) * 100);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  private patchTaskForm(task: Item): void {
    this.taskForm.patchValue(
      {
        description: task.description,
        obs: task.obs ?? '',
        where: task.where,
        estimated_pomodoros: task.estimated_pomodoros ?? 1,
      },
      { emitEvent: false }
    );
  }
}

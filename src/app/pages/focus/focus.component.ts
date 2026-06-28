import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { Dropdown } from 'src/app/models/dropdown';
import { FocusSettingsUpdate, SoundLayer } from 'src/app/models/focus';
import { Item } from 'src/app/models/item';
import { FocusFacade, FocusState } from 'src/app/facades/focus.facade';
import { ThemeService } from 'src/app/services/theme.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { getStoredUserId } from 'src/app/utils/stored-user.util';
import { plannerDialogStyleClass } from 'src/app/utils/planner-dialog.util';
import {
  FOCUS_BACKGROUNDS,
  FocusBackground,
  getFocusBackgroundById,
} from 'src/app/config/focus-backgrounds';
import {
  FOCUS_SOUNDS,
  FocusSound,
  MAX_SOUND_LAYERS,
  getFocusSoundById,
} from 'src/app/config/focus-sounds';

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
  soundsVisible = false;
  readonly defaultProjectFilter: Dropdown[];
  projectFilterOptions$: Observable<Dropdown[]>;
  selectedProjectId = '';
  readonly backgrounds: FocusBackground[] = FOCUS_BACKGROUNDS;

  readonly sounds: FocusSound[] = FOCUS_SOUNDS;
  readonly maxLayers = MAX_SOUND_LAYERS;
  mix: SoundLayer[] = [];
  masterVolume = 0.5;

  tasksCollapsed = false;
  editCollapsed = false;
  private static readonly TASKS_COLLAPSED_KEY = 'focus.tasksCollapsed';
  private static readonly EDIT_COLLAPSED_KEY = 'focus.editCollapsed';

  private subs = new SubSink();

  constructor(
    public focusFacade: FocusFacade,
    public themeService: ThemeService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private projectsService: ProjectsService,
    private translate: TranslateService
  ) {
    this.defaultProjectFilter = [
      { name: this.translate.instant('planner.allProjects'), code: '' },
    ];
    this.projectFilterOptions$ = of(this.defaultProjectFilter);

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
      background_id: ['forest', Validators.required],
      auto_start_breaks: [false],
      auto_start_focus: [false],
      notify_on_complete: [true],
    });
  }

  get settingsDialogStyleClass(): string {
    return plannerDialogStyleClass(this.themeService.theme);
  }

  /** Only the very first load blocks the screen; later actions keep the UI mounted. */
  get isInitialLoading(): boolean {
    return !this.state || (this.state.loading && !this.state.settings);
  }

  ngOnInit(): void {
    this.tasksCollapsed = localStorage.getItem(FocusComponent.TASKS_COLLAPSED_KEY) === 'true';
    this.editCollapsed = localStorage.getItem(FocusComponent.EDIT_COLLAPSED_KEY) === 'true';

    this.subs.add(
      this.focusFacade.state$.subscribe((state) => {
        this.state = state;
        if (state.selectedTask) {
          this.patchTaskForm(state.selectedTask);
        }
        if (state.settings && !this.settingsVisible && !this.soundsVisible) {
          this.settingsForm.patchValue(state.settings, { emitEvent: false });
          this.mix = (state.settings.ambient_mix ?? []).map((layer) => ({ ...layer }));
          this.masterVolume = state.settings.sound_volume ?? 0.5;
        }
        this.cdr.markForCheck();
      })
    );

    this.focusFacade.init(this.route.snapshot.queryParamMap.get('taskId'));
    this.projectFilterOptions$ = this.buildProjectFilterOptions();
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
    const isDark = this.themeService.theme === 'theme-dark';
    const overlay = isDark
      ? 'linear-gradient(rgba(8, 12, 22, 0.42), rgba(8, 12, 22, 0.52))'
      : 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(244, 247, 251, 0.55))';

    return {
      backgroundImage: `${overlay}, url('${background.imageUrl}')`,
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
      return 'focus.statusReady';
    }
    if (this.state.isRunning) {
      return 'focus.statusFocusing';
    }
    if (this.state.session.status === 'paused') {
      return 'focus.statusPaused';
    }
    return 'focus.statusReady';
  }

  onProjectFilterChange(projectId: string): void {
    this.selectedProjectId = projectId;
    this.focusFacade.setProjectFilter(projectId || null);
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

  openSounds(): void {
    if (this.state?.settings) {
      this.mix = (this.state.settings.ambient_mix ?? []).map((layer) => ({ ...layer }));
      this.masterVolume = this.state.settings.sound_volume ?? 0.5;
    }
    this.soundsVisible = true;
    this.focusFacade.setPreview(true);
  }

  onSoundsHide(): void {
    this.focusFacade.setPreview(false);
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    this.focusFacade.saveSettings(this.settingsForm.value as FocusSettingsUpdate);
    this.settingsVisible = false;
  }

  isSoundActive(id: string): boolean {
    return this.mix.some((layer) => layer.id === id);
  }

  layerVolume(id: string): number {
    return this.mix.find((layer) => layer.id === id)?.volume ?? 0.6;
  }

  get canAddSound(): boolean {
    return this.mix.length < this.maxLayers;
  }

  toggleSound(id: string): void {
    if (this.isSoundActive(id)) {
      this.mix = this.mix.filter((layer) => layer.id !== id);
    } else {
      if (!this.canAddSound) {
        return;
      }
      const layer: SoundLayer = { id, volume: 0.6 };
      if (getFocusSoundById(id)?.mode === 'oneshot') {
        layer.density = 0.5;
      }
      this.mix = [...this.mix, layer];
    }
    this.focusFacade.updateMix(this.mix);
  }

  layerDensity(id: string): number {
    return this.mix.find((layer) => layer.id === id)?.density ?? 0.5;
  }

  onLayerDensityInput(id: string, density: number): void {
    this.mix = this.mix.map((layer) =>
      layer.id === id ? { ...layer, density } : layer
    );
    this.focusFacade.applyMixLive(this.mix);
  }

  onLayerDensityCommit(id: string): void {
    this.focusFacade.updateMix(this.mix);
    this.focusFacade.previewLayer(id);
  }

  onLayerVolumeInput(id: string, volume: number): void {
    this.mix = this.mix.map((layer) =>
      layer.id === id ? { ...layer, volume } : layer
    );
    this.focusFacade.applyMixLive(this.mix);
  }

  onLayerVolumeCommit(): void {
    this.focusFacade.updateMix(this.mix);
  }

  onMasterVolumeInput(volume: number): void {
    this.masterVolume = volume;
    this.focusFacade.applyMasterVolumeLive(volume);
  }

  onMasterVolumeCommit(): void {
    this.focusFacade.updateMasterVolume(this.masterVolume);
  }

  taskProgressLabel(task: Item): string {
    const completed = task.pomodoros_completed ?? 0;
    const estimated = task.estimated_pomodoros ?? 1;
    return this.translate.instant('focus.pomodorosProgress', {
      completed: completed.toFixed(1),
      estimated,
    });
  }

  taskProgressPercent(task: Item): number {
    return Math.round((task.task_focus_progress ?? 0) * 100);
  }

  toggleTasks(): void {
    this.tasksCollapsed = !this.tasksCollapsed;
    localStorage.setItem(FocusComponent.TASKS_COLLAPSED_KEY, String(this.tasksCollapsed));
  }

  toggleEditPanel(): void {
    this.editCollapsed = !this.editCollapsed;
    localStorage.setItem(FocusComponent.EDIT_COLLAPSED_KEY, String(this.editCollapsed));
  }

  goHome(): void {
    this.router.navigate(['/']);
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

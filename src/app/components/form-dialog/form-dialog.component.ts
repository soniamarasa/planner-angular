import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Dropdown } from 'src/app/models/dropdown';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { WeekService } from 'src/app/services/week.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { Item } from 'src/app/models/item';
import { Project } from 'src/app/models/project';
import { getStoredUserId } from 'src/app/utils/stored-user.util';

@Component({
  selector: 'app-form-dialog',
  standalone: false,
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  providers: [MessageService],
})
export class FormDialogComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  type: Dropdown[];
  projectOptions: Dropdown[] = [{ name: '', code: '' }];
  private readonly subs = new SubSink();

  constructor(
    public _formBuilder: FormBuilder,
    public _ref: DynamicDialogRef,
    public _config: DynamicDialogConfig,
    private _messageService: MessageService,
    private facade: ItemsFacade,
    private weekService: WeekService,
    private projectsService: ProjectsService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.type = [
      { name: this.translate.instant('type.task'), code: 'task' },
      { name: this.translate.instant('type.event'), code: 'event' },
      { name: this.translate.instant('type.appointment'), code: 'appointment' },
      { name: this.translate.instant('type.note'), code: 'note' },
      { name: this.translate.instant('type.tv'), code: 'tv' },
    ];
    this.projectOptions = [{ name: this.translate.instant('form.noProject'), code: '' }];
    this.createForm();
  }

  ngOnInit(): void {
    this.subs.sink = this.form.get('scheduledDate')!.valueChanges.subscribe((date) => {
      if (date) {
        this.form.patchValue({ notes: false, todo: false }, { emitEvent: false });
      }
      this.syncPlacementControls();
    });

    this.subs.sink = this.form.get('notes')!.valueChanges.subscribe((checked) => {
      if (checked) {
        this.form.patchValue({ todo: false, scheduledDate: null }, { emitEvent: false });
      }
      this.syncPlacementControls();
    });

    this.subs.sink = this.form.get('todo')!.valueChanges.subscribe((checked) => {
      if (checked) {
        this.form.patchValue({ notes: false, scheduledDate: null }, { emitEvent: false });
      }
      this.syncPlacementControls();
    });

    this.syncPlacementControls();
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  createForm(): void {
    const presetDate = this._config.data?.scheduledDate as Date | string | undefined;
    const initialDate = presetDate
      ? presetDate instanceof Date
        ? presetDate
        : this.weekService.parseDateKey(presetDate)
      : null;

    const presetProjectId = (this._config.data?.projectId as string) ?? '';

    this.form = this._formBuilder.group({
      type: ['', Validators.required],
      description: ['', Validators.required],
      obs: [''],
      scheduledDate: [initialDate],
      notes: [false],
      todo: [false],
      projectId: [presetProjectId],
    });
  }

  private loadProjects(): void {
    const userId = getStoredUserId();
    if (!userId) {
      return;
    }
    this.subs.add(
      this.projectsService.getProjects(userId).subscribe({
        next: (projects) => {
          this.projectOptions = [
            { name: this.translate.instant('form.noProject'), code: '' },
            ...projects.map((project: Project) => ({ name: project.name, code: project.id! })),
          ];
          const preset = this._config.data?.projectId as string | undefined;
          if (preset) {
            this.form.patchValue({ projectId: preset }, { emitEvent: false });
          }
          setTimeout(() => this.cdr.detectChanges());
        },
      })
    );
  }

  private syncPlacementControls(): void {
    const scheduledDate = this.form.get('scheduledDate')!.value;
    const notes = this.form.get('notes')!.value;
    const todo = this.form.get('todo')!.value;
    const hasDate = !!scheduledDate;
    const hasEvergreen = notes || todo;

    if (hasDate) {
      this.form.get('notes')!.disable({ emitEvent: false });
      this.form.get('todo')!.disable({ emitEvent: false });
      this.form.get('scheduledDate')!.enable({ emitEvent: false });
      return;
    }

    if (hasEvergreen) {
      this.form.get('scheduledDate')!.disable({ emitEvent: false });
      this.form.get('notes')!.enable({ emitEvent: false });
      this.form.get('todo')!.enable({ emitEvent: false });
      return;
    }

    this.form.get('scheduledDate')!.enable({ emitEvent: false });
    this.form.get('notes')!.enable({ emitEvent: false });
    this.form.get('todo')!.enable({ emitEvent: false });
  }

  validation(): boolean {
    const value = this.form.getRawValue();

    if (!value.type || !value.description?.trim()) {
      this._messageService.add({
        severity: 'warn',
        summary: this.translate.instant('form.emptyFields'),
        detail: this.translate.instant('form.emptyFieldsDetail'),
      });
      return false;
    }

    if (!value.scheduledDate && !value.notes && !value.todo) {
      this._messageService.add({
        severity: 'warn',
        summary: this.translate.instant('form.chooseDestination'),
        detail: this.translate.instant('form.chooseDestinationDetail'),
      });
      return false;
    }

    return true;
  }

  buildPayload(): (Item & { scheduled_date?: string | null }) | null {
    const value = this.form.getRawValue();

    if (value.scheduledDate) {
      const date = value.scheduledDate instanceof Date ? value.scheduledDate : new Date(value.scheduledDate);
      return {
        type: value.type,
        description: value.description,
        obs: value.obs,
        where: this.weekService.whereForScheduledDate(date),
        scheduled_date: this.weekService.toDateKey(date),
        started: false,
        finished: false,
        important: false,
        canceled: false,
        project_id: value.projectId || null,
      };
    }

    if (value.notes) {
      return {
        type: value.type,
        description: value.description,
        obs: value.obs,
        where: 'notes',
        scheduled_date: null,
        started: false,
        finished: false,
        important: false,
        canceled: false,
        project_id: value.projectId || null,
      };
    }

    if (value.todo) {
      return {
        type: value.type,
        description: value.description,
        obs: value.obs,
        where: 'todo',
        scheduled_date: null,
        started: false,
        finished: false,
        important: false,
        canceled: false,
        project_id: value.projectId || null,
      };
    }

    return null;
  }

  newItem(): void {
    if (!this.validation()) {
      return;
    }

    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    this.subs.add(
      this.facade.create(payload).subscribe({
        next: (success) => {
          if (success) {
            this._ref.close(true);
          }
        },
      })
    );
  }
}

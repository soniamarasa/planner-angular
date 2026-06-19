import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Dropdown } from 'src/app/models/dropdown';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { WeekService } from 'src/app/services/week.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { Item } from 'src/app/models/item';
import { Project } from 'src/app/models/project';
import { getStoredUserId } from 'src/app/utils/stored-user.util';

@Component({
  selector: 'app-edit-form',
  standalone: false,
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.scss'],
})
export class EditFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  type: Dropdown[];
  projectOptions: Dropdown[] = [{ name: 'No project', code: '' }];
  private readonly subs = new SubSink();

  constructor(
    public formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private facade: ItemsFacade,
    private messageService: MessageService,
    private weekService: WeekService,
    private projectsService: ProjectsService,
    private cdr: ChangeDetectorRef
  ) {
    this.type = [
      { name: 'Task', code: 'task' },
      { name: 'Event', code: 'event' },
      { name: 'Appointment', code: 'appointment' },
      { name: 'Note', code: 'note' },
      { name: 'Entertainment', code: 'tv' },
    ];
    this.createForm(this.config.data as Item);
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

  createForm(data: Item): void {
    const isNotes = data.where === 'notes';
    const isTodo = data.where === 'todo';
    const scheduledDate = data.scheduled_date
      ? this.weekService.parseDateKey(data.scheduled_date)
      : null;

    this.form = this.formBuilder.group({
      type: [data.type, Validators.required],
      description: [data.description, Validators.required],
      obs: [data.obs ?? ''],
      scheduledDate: [scheduledDate],
      notes: [isNotes],
      todo: [isTodo],
      projectId: [data.project_id ?? ''],
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
            { name: 'No project', code: '' },
            ...projects.map((project: Project) => ({ name: project.name, code: project.id! })),
          ];
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

    if (!value.description?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'The description field is required!',
      });
      return false;
    }

    if (!value.scheduledDate && !value.notes && !value.todo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Choose a destination',
        detail: 'Select a date, Notes, or To Do.',
      });
      return false;
    }

    return true;
  }

  buildPayload(): Item & { scheduled_date?: string | null } {
    const value = this.form.getRawValue();

    if (value.scheduledDate) {
      const date =
        value.scheduledDate instanceof Date ? value.scheduledDate : new Date(value.scheduledDate);
      return {
        type: value.type,
        description: value.description,
        obs: value.obs,
        where: this.weekService.whereForScheduledDate(date),
        scheduled_date: this.weekService.toDateKey(date),
        started: this.config.data.started,
        finished: this.config.data.finished,
        important: this.config.data.important,
        canceled: this.config.data.canceled,
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
        started: this.config.data.started,
        finished: this.config.data.finished,
        important: this.config.data.important,
        canceled: this.config.data.canceled,
        project_id: value.projectId || null,
      };
    }

    return {
      type: value.type,
      description: value.description,
      obs: value.obs,
      where: 'todo',
      scheduled_date: null,
      started: this.config.data.started,
      finished: this.config.data.finished,
      important: this.config.data.important,
      canceled: this.config.data.canceled,
      project_id: value.projectId || null,
    };
  }

  editItem(): void {
    if (!this.validation()) {
      return;
    }

    this.facade.update(this.config.data.id, this.buildPayload());
    this.ref.close();
  }
}

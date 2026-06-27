import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

import { PROJECT_COLOR_OPTIONS, PROJECT_ICON_OPTIONS } from 'src/app/config/project-icons';
import { Project } from 'src/app/models/project';
import { projectIconClass } from 'src/app/utils/project-icon.util';

@Component({
  selector: 'app-project-form-dialog',
  standalone: false,
  templateUrl: './project-form-dialog.component.html',
  styleUrls: ['./project-form-dialog.component.scss'],
})
export class ProjectFormDialogComponent {
  form: FormGroup;
  icons = PROJECT_ICON_OPTIONS;
  colors = PROJECT_COLOR_OPTIONS;
  isEdit = false;

  constructor(
    private formBuilder: FormBuilder,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService,
    private translate: TranslateService
  ) {
    const project = this.config.data?.project as Project | undefined;
    this.isEdit = !!project?.id;

    this.form = this.formBuilder.group({
      name: [project?.name ?? '', Validators.required],
      icon: [project?.icon ?? 'pi-briefcase', Validators.required],
      color: [project?.color ?? '#ff9a3d', Validators.required],
    });
  }

  iconClass(icon: string): string {
    return projectIconClass(icon);
  }

  selectIcon(icon: string): void {
    this.form.patchValue({ icon });
  }

  selectColor(color: string): void {
    this.form.patchValue({ color });
  }

  save(): void {
    if (this.form.invalid || !this.form.value.name?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('projectForm.nameRequired'),
        detail: this.translate.instant('projectForm.nameRequiredDetail'),
      });
      return;
    }

    this.ref.close({
      ...this.form.value,
      name: this.form.value.name.trim(),
    });
  }

  cancel(): void {
    this.ref.close();
  }
}

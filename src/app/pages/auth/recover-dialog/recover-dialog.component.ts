import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FormGroup, Validators, UntypedFormBuilder } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { UserFacade } from 'src/app/facades/user.facades';
import { SubSink } from 'subsink';
import { finalize, tap } from 'rxjs';

@Component({
  selector: 'app-recover-dialog',
  templateUrl: './recover-dialog.component.html',
  styleUrls: ['./recover-dialog.component.scss'],
  providers: [MessageService],
})
export class RecoverDialogComponent implements OnInit {
  form!: FormGroup;
  subs = new SubSink();

  constructor(
    public _formBuilder: UntypedFormBuilder,
    public _ref: DynamicDialogRef,
    public _config: DynamicDialogConfig,
    private _messageService: MessageService,
    private facade: UserFacade
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  get formControl() {
    return this.form.controls;
  }

  createForm(): any {
    this.form = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit() {
    this.subs.add(
      this.facade
        .retrievePassword(this.form.value)
        .pipe(tap(() => this._ref.destroy()))
        .subscribe({
          next: (res) => {
            console.log(res.message);
            this._messageService.add({
              key: 'notification',
              severity: 'error',
              summary: 'Houve um problema!',
              detail: res.message,
              icon: 'fa-solid fa-check',
            });
          },
          error: (error) =>
            this._messageService.add({
              key: 'notification',
              severity: 'error',
              summary: 'Houve um problema!',
              detail: error.message,
              icon: 'fa-solid fa-check',
            }),
        })
    );
  }
}

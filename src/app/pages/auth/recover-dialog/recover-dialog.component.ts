import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FormGroup, Validators, UntypedFormBuilder } from '@angular/forms';

import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-recover-dialog',
  templateUrl: './recover-dialog.component.html',
  styleUrls: ['./recover-dialog.component.scss'],
  providers: [MessageService],
})
export class RecoverDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    public _formBuilder: UntypedFormBuilder,
    public _ref: DynamicDialogRef,
    public _config: DynamicDialogConfig,
    private _messageService: MessageService
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
    console.log(this.form.value);
    this._ref.destroy();
  }
}

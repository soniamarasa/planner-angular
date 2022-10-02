import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { SubSink } from 'subsink';

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
    this._ref.close(this.form.value.email);
  }
}

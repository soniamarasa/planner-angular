import { Component, OnInit } from '@angular/core';
import { Dropdown } from 'src/app/models/dropdown';
import {
  FormGroup,
  Validators,
  UntypedFormBuilder,
  AbstractControlOptions,
} from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';

@Component({
  selector: 'app-password-recover',
  templateUrl: './password-recover.component.html',
  styleUrls: ['./password-recover.component.scss'],
})
export class PasswordRecoverComponent implements OnInit {
  form!: FormGroup;

  constructor(
    public _formBuilder: UntypedFormBuilder,
    private _messageService: MessageService,
    private customValidator: CustomvalidationService
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  get formControl() {
    return this.form.controls;
  }

  createForm(): any {
    this.form = this._formBuilder.group(
      {
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: [
          this.customValidator.MatchPassword('password', 'confirmPassword'),
        ],
      } as AbstractControlOptions
    );
  }

  submit() {
    console.log(this.form.value);
  }
}

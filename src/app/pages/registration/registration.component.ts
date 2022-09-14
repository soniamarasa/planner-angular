import { Component, OnInit } from '@angular/core';
import { Dropdown } from 'src/app/models/dropdown';
import {
  FormGroup,
  FormBuilder,
  Validators,
  UntypedFormBuilder,
  AbstractControlOptions,
} from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
  form!: FormGroup;
  gender: Dropdown[];

  constructor(
    public _formBuilder: UntypedFormBuilder,
    private _messageService: MessageService,
    private customValidator: CustomvalidationService,

    private facade: ItemsFacade
  ) {
    this.createForm();

    this.gender = [
      { name: 'Female', code: 'female' },
      { name: 'Male', code: 'male' },
    ];
  }

  ngOnInit(): void {}

  get formControl() {
    return this.form.controls;
  }

  createForm(): any {
    this.form = this._formBuilder.group(
      {
        name: ['', Validators.required],
        gender: ['', Validators.required],
        birthdate: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', [Validators.required]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: [
          this.customValidator.MatchPassword('password', 'confirmPassword'),
          this.customValidator.MatchEmail('email', 'confirmEmail'),
        ],
      } as AbstractControlOptions
    );
  }

  submit() {
    console.log(this.form.value);
  }
}

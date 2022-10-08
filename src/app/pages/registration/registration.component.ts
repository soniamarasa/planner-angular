import { Component, OnInit } from '@angular/core';
import { Dropdown } from 'src/app/models/dropdown';
import {
  FormGroup,
  Validators,
  UntypedFormBuilder,
  AbstractControlOptions,
} from '@angular/forms';

import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SubSink } from 'subsink';

import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { UserFacade } from 'src/app/facades/user.facades';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
  form!: FormGroup;
  gender: Dropdown[];
  private subs = new SubSink();

  isSubmitting = false;

  constructor(
    public _formBuilder: UntypedFormBuilder,
    private _messageService: MessageService,
    private _router: Router,
    private customValidator: CustomvalidationService,
    private facade: UserFacade
  ) {
    this.subs.add(
      this.facade.authState$.subscribe(
        ({ isAuthenticated }) => isAuthenticated && this._router.navigate(['/'])
      )
    );

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
        password: [
          '',
          [
            Validators.required,
            Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'),
          ],
        ],
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
    this.isSubmitting = true;

    this.subs.add(
      this.facade
        .newUser(this.form.value)
        .pipe(finalize(() => (this.isSubmitting = false)))
        .subscribe({
          next: (res) => {
            this._messageService.add({
              key: 'notification',
              severity: 'success',
              summary: 'Success!',
              detail: 'Your account has been successfully created.',
              icon: 'fa-solid fa-check',
            }),
              setTimeout(() => this._router.navigate(['/auth']), 1500);
          },
          error: (error) =>
            this._messageService.add({
              key: 'notification',
              severity: 'error',
              summary: 'An error has occurred!',
              detail: error.error.error,
              icon: 'fa-solid fa-check',
            }),
        })
    );
  }
}

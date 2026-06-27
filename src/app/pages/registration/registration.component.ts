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
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';

import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { UserFacade } from 'src/app/facades/user.facades';

@Component({
  selector: 'app-registration',
  standalone: false,
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
    private facade: UserFacade,
    private translate: TranslateService
  ) {
    this.subs.add(
      this.facade.authState$.subscribe(
        ({ isAuthenticated }) => isAuthenticated && this._router.navigate(['/'])
      )
    );

    this.createForm();

    this.gender = [
      { name: this.translate.instant('gender.female'), code: 'female' },
      { name: this.translate.instant('gender.male'), code: 'male' },
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
              summary: this.translate.instant('common.successTitle'),
              detail: this.translate.instant('register.accountCreated'),
              icon: 'fa-solid fa-check',
            }),
              setTimeout(() => this._router.navigate(['/auth']), 1500);
          },
          error: (error) =>
            this._messageService.add({
              key: 'notification',
              severity: 'error',
              summary: this.translate.instant('common.errorTitle'),
              detail: error.error.error,
              icon: 'fa-solid fa-check',
            }),
        })
    );
  }
}

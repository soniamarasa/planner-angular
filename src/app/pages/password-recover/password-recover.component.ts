import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  UntypedFormBuilder,
  AbstractControlOptions,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SubSink } from 'subsink';

import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { UserFacade } from 'src/app/facades/user.facades';

@Component({
  selector: 'app-password-recover',
  templateUrl: './password-recover.component.html',
  styleUrls: ['./password-recover.component.scss'],
})
export class PasswordRecoverComponent implements OnInit {
  form!: FormGroup;
  subs = new SubSink();
  token!: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    public _formBuilder: UntypedFormBuilder,
    private _messageService: MessageService,
    private customValidator: CustomvalidationService,
    private facade: UserFacade
  ) {
    this.createForm();

    this.token = this._route.snapshot.params['token'];
  }

  ngOnInit(): void {}

  get formControl() {
    return this.form.controls;
  }

  createForm(): any {
    this.form = this._formBuilder.group(
      {
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
        ],
      } as AbstractControlOptions
    );
  }

  submit() {
    this.subs.add(
      this.facade
        .resetPassword(this.form.value.password, this.token)
        .subscribe({
          next: (res) => {
            this._messageService.add({
              key: 'notification',
              severity: 'success',
              summary: 'Success!',
              detail: res.message,
              icon: 'fa-solid fa-check',
            });

            setTimeout(() => this._router.navigate(['/auth']), 1000);
          },

          error: (error) => {
            this._messageService.add({
              key: 'notification',
              severity: 'error',
              summary: 'An error has occurred!',
              detail: error.error.error,
              icon: 'fa-solid fa-check',
            });
          },
        })
    );
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  Validators,
  UntypedFormBuilder,
  AbstractControlOptions,
} from '@angular/forms';
import { finalize, tap } from 'rxjs';
import { SubSink } from 'subsink';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { UserFacade } from 'src/app/facades/user.facades';
import { Dropdown } from 'src/app/models/dropdown';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-account',
  standalone: false,
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  private subs = new SubSink();

  formData!: FormGroup;
  formPassword!: FormGroup;
  gender: Dropdown[];
  user!: User;

  showBtnForm: boolean = false;
  showBtnFormPass: boolean = false;
  isSubmitting!: boolean;

  isLoaded: boolean = false;

  constructor(
    public _formBuilder: UntypedFormBuilder,
    private _messageService: MessageService,
    private customValidator: CustomvalidationService,
    private facade: UserFacade,
    private translate: TranslateService
  ) {
    this.gender = [
      { name: this.translate.instant('gender.female'), code: 'female' },
      { name: this.translate.instant('gender.male'), code: 'male' },
    ];
  }

  ngOnInit(): void {
    this.subs.add(
      this.facade.getUser().subscribe((user) => {
        this.user = user;
        this.setForms(this.user);
        this.formData.statusChanges.subscribe(() => (this.showBtnForm = true));
        this.formPassword.statusChanges.subscribe(
          () => (this.showBtnFormPass = true)
        );
      })
    );
  }

  setForms(user: User) {
    this.createForm(user);
    this.createFormPassword(user);
    this.isLoaded = true;
  }

  createForm(user: User): any {
    this.formData = this._formBuilder.group({
      name: [user.name, Validators.required],
      gender: [user.gender, Validators.required],
      email: [user.email, [Validators.required, Validators.email]],
      birthdate: [new Date(user.birthdate), Validators.required],
    });
  }

  createFormPassword(user: User): any {
    this.formPassword = this._formBuilder.group(
      {
        oldPassword: ['', [Validators.required]],
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

  get formControl() {
    return this.formData.controls;
  }

  get formPasswordControl() {
    return this.formPassword.controls;
  }

  resetForm() {
    this.showBtnForm = false;
    this.showBtnFormPass = false;

    this.setForms(this.user);
  }

  submit(form: number) {
    this.isSubmitting = true;

    let data: User = this.formData.value;

    if (form === 1) {
      this.subs.add(
        this.facade
          .updateUser(data)
          .pipe(finalize(() => (this.isSubmitting = false)))
          .subscribe({
            next: (res) => {
              this.showBtnForm = false;
              this._messageService.add({
                key: 'notification',
                severity: 'success',
                summary: this.translate.instant('common.successTitle'),
                detail: this.translate.instant('account.detailsUpdated'),
                icon: 'fa-solid fa-check',
              });
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
    } else {
      this.subs.add(
        this.facade
          .updateUser({ ...data, ...this.formPassword.value })
          .pipe(finalize(() => (this.isSubmitting = false)))
          .subscribe({
            next: (res) => {
              this.showBtnFormPass = false;
              this._messageService.add({
                key: 'notification',
                severity: 'success',
                summary: this.translate.instant('common.successTitle'),
                detail: this.translate.instant('account.passwordUpdated'),
                icon: 'fa-solid fa-check',
              });
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
}

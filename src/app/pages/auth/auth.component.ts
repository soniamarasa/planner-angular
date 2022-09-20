import { Component, OnInit } from '@angular/core';
import { Dropdown } from 'src/app/models/dropdown';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SubSink } from 'subsink';

import { MessageService } from 'primeng/api';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { DialogService } from 'primeng/dynamicdialog';
import { RecoverDialogComponent } from './recover-dialog/recover-dialog.component';
import { Router } from '@angular/router';
import { UserFacade } from 'src/app/facades/user.facades';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  form!: FormGroup;
  private subs = new SubSink();

  isSubmitting = false;

  constructor(
    public _formBuilder: FormBuilder,
    public _dialogService: DialogService,
    private _router: Router,
    private _messageService: MessageService,
    private facade: UserFacade
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  createForm(): any {
    this.form = this._formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  openDialogRecover() {
    const ref = this._dialogService.open(RecoverDialogComponent, {
      width: '500px',
    });
  }

  login() {
    this.isSubmitting = true;

    this.subs.add(
      this.facade
        .login(this.form.value)
        .pipe(finalize(() => (this.isSubmitting = false)))
        .subscribe({
          next: (user) => {
            setTimeout(() => this._router.navigate(['/']), 1500);
          },
          error: () =>
            this._messageService.add({
              key: 'notification',
              severity: 'error',
              summary: 'Houve um problema!',
              detail:
                'Não foi possível entrar na sua conta. Tente novamente mais tarde.',
              icon: 'fa-solid fa-check',
            }),
        })
    );
  }
}

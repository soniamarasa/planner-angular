import { Component, OnInit } from '@angular/core';
import { Dropdown } from 'src/app/models/dropdown';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ItemsFacade } from 'src/app/facades/items.facade';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  form!: FormGroup;

  constructor(
    public _formBuilder: FormBuilder,
    private _messageService: MessageService,
    private facade: ItemsFacade
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

  cleanValues(): any {
    this.form.controls['email'].setValue('task');
    this.form.controls['password'].setValue('');
  }

  validation() {
    if (this.form.value.email === '' || this.form.value.password === '') {
      this._messageService.add({
        severity: 'warn',
        summary: 'Empty fields!',
        detail: 'Type, description and checkbox are required!',
      });
      console.log('form vazio');
      return false;
    } else {
      return true;
    }
  }

  login() {
    const checkValidation = this.validation();
    if (checkValidation) {
      this.facade.create(this.form.value);
    }
  }
}

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
import { UserFacade } from 'src/app/facades/user.facades';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  form!: FormGroup;
  gender: Dropdown[];
  
  constructor(
    public _formBuilder: UntypedFormBuilder,
    private _messageService: MessageService,
    private customValidator: CustomvalidationService,

    private facade: UserFacade
  ) {
    this.createForm();

    this.gender = [
      { name: 'Female', code: 'female' },
      { name: 'Male', code: 'male' },
    ];
  }

  ngOnInit(): void {

  


    this.facade
      .getUser()
      .subscribe((x) => console.log(x));
  }

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
        oldPassword: ['', [Validators.required]],
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

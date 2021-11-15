import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Dropdown } from 'src/app/models/dropdown';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { ItemsFacade } from 'src/app/facades/items.facade';

@Component({
  selector: 'app-edit-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.scss'],
})
export class EditFormComponent implements OnInit {
  form!: FormGroup;
  type: Dropdown[];
  box: Dropdown[];

  constructor(
    public formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private facade: ItemsFacade,
    private messageService: MessageService
  ) {
    this.createForm(this.config.data);

    this.type = [
      { name: 'Task', code: 'task' },
      { name: 'Event', code: 'event' },
      { name: 'Appointment', code: 'appointment' },
      { name: 'Note', code: 'note' },
      { name: 'Entertainment', code: 'tv' },
    ];
    this.box = [
      { name: 'Mon', code: 'mon' },
      { name: 'Tue', code: 'tue' },
      { name: 'Wed', code: 'wed' },
      { name: 'Thu', code: 'thu' },
      { name: 'Fri', code: 'fri' },
      { name: 'Sat', code: 'sat' },
      { name: 'Sun', code: 'sun' },
      { name: 'To Do', code: 'todo' },
      { name: 'Notes', code: 'notes' },
    ];
  }

  ngOnInit(): void {}

  createForm(data: any): any {
    this.form = this.formBuilder.group({
      type: [data.type, Validators.required],
      description: [data.description, Validators.required],
      obs: [data.obs, Validators.required],
      where: [data.where, Validators.required],
    });
  }

  validation() {
    if (this.form.value.description === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'The description field is required!',
      });
      console.log('form vazio');
      return false;
    } else {
      return true;
    }
  }

  editItem() {
    const checkValidation = this.validation();
    if (checkValidation) {
      this.facade.update(this.config.data._id, this.form.value);
    }
  }
}

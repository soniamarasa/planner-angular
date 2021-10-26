import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Dropdown } from 'src/app/models/dropdown';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';

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
    public config: DynamicDialogConfig
  ) {
    this.createForm();

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

  createForm(): any {
    this.form = this.formBuilder.group({
      type: ['', Validators.required],
      description: ['', Validators.required],
      obs: ['', Validators.required],
      where: ['', Validators.required],
    });
  }

  newItem() {
    console.log(this.form.value);
  }
}

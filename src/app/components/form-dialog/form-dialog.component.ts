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
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
})
export class FormDialogComponent implements OnInit {
  form!: FormGroup;
  getWhere: any;
  @ViewChildren('checkbox') checkboxes!: QueryList<ElementRef>;
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
      { name: 'Sat', code: 'fri' },
      { name: 'Sun', code: 'fri' },
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
      where: this.formBuilder.array([], Validators.required),
    });
  }

  cleanValues(): any {
    this.form.controls['type'].setValue('task');
    this.form.controls['description'].setValue('');
    (this.form.get('where') as FormArray).clear();
    this.checkboxes.forEach((element) => {
      element.nativeElement.checked = false;
    });
  }

  onCheckChange(event: any): any {
    console.log(event);
    const formArray: FormArray = this.form.get('where') as FormArray;
    if (event.checked) {
      formArray.push(new FormControl(event.checked[0]));
    } else {
      let i = 0;
      formArray.controls.forEach((item) => {
        console.log(item.value);
        console.log(event.checked[0]);
        if (item.value === event.checked[0]) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
    this.getWhere = formArray.value;
  }

  newItem() {
    console.log(this.form.value);
  }
}

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
import { ItemsFacade } from 'src/app/facades/items.facade';

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

  constructor(
    public formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private facade: ItemsFacade
  ) {
    this.createForm();

    this.type = [
      { name: 'Task', code: 'task' },
      { name: 'Event', code: 'event' },
      { name: 'Appointment', code: 'appointment' },
      { name: 'Note', code: 'note' },
      { name: 'Entertainment', code: 'tv' },
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

  onCheckChanges(id: any, event: any): any {
    const formArray: FormArray = this.form.get('where') as FormArray;
    if (event.checked.length != 0) {
      formArray.push(new FormControl(event.checked[0]));
    } else {
      let i = 0;
      formArray.controls.forEach((item) => {
        console.log(item.value);
        console.log(event.checked[0]);
        if (item.value === id) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
    this.getWhere = formArray.value;
  }

  validation() {
    if (
      this.form.value.description === '' ||
      this.form.value.where.length === 0
    ) {
      // this.toastr.error(
      //   'É obrigatório preencher/marcar uma opção',
      //   'Campos vazios'
      // );
      console.log('form vazio');
      return false;
    } else {
      return true;
    }
  }

  newItem() {
    const checkValidation = this.validation();
    if (checkValidation) {
      this.facade.create(this.form.value);
      this.ref.close();
    }
  }
}

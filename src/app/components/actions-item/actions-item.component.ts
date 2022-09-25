import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ThemeService } from 'src/app/services/theme.service';
import { ItemsService } from 'src/app/services/items.service';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { EditFormComponent } from '../edit-form/edit-form.component';

@Component({
  selector: 'app-actions-item',
  templateUrl: './actions-item.component.html',
  styleUrls: ['./actions-item.component.scss'],
})
export class ActionsItemComponent implements OnInit {
  @Input() type!: any;
  @Input() description!: any;
  @Input() obs!: any;
  @Input() where: any;
  @Input() id: any;
  @Input() finished!: boolean;
  @Input() started!: boolean;
  @Input() canceled!: boolean;
  @Input() important!: boolean;

  constructor(
    public service: ItemsService,
    public facade: ItemsFacade,
    public dialogService: DialogService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {}

  editDialog() {
    const initialState = {
      _id: this.id,
      type: this.type,
      description: this.description,
      obs: this.obs,
      where: this.where,
    };

    let dialog = { component: EditFormComponent, title: 'Edit Item' };

    const ref = this.dialogService.open(dialog.component, {
      header: dialog.title,
      width: 'max-content',
      styleClass: this.themeService.theme + ' modal',
      data: initialState,
    });
  }
}

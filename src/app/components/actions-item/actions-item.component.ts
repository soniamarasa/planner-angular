import { Component, Input, OnInit } from '@angular/core';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { ItemsService } from 'src/app/services/items.service';
import { EditFormComponent } from '../edit-form/edit-form.component';

import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { Dropdown } from 'src/app/models/dropdown';
import { Button } from 'primeng/button';
import { ThemeService } from 'src/app/services/theme.service';

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
    private confirmationService: ConfirmationService,
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

    let dialog = { component: EditFormComponent, title: 'Editar Item' };

    const ref = this.dialogService.open(dialog.component, {
      header: dialog.title,
      width: 'max-content',
      styleClass: this.themeService.theme + ' modal',
      data: initialState,
    });
  }
}

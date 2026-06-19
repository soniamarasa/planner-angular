import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { plannerDialogConfig } from 'src/app/utils/planner-dialog.util';
import { ThemeService } from 'src/app/services/theme.service';
import { ItemsService } from 'src/app/services/items.service';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { EditFormComponent } from '../edit-form/edit-form.component';
import { Item } from 'src/app/models/item';

@Component({
  selector: 'app-actions-item',
  standalone: false,
  templateUrl: './actions-item.component.html',
  styleUrls: ['./actions-item.component.scss'],
})
export class ActionsItemComponent implements OnInit {
  @Input() item!: Item;

  constructor(
    public service: ItemsService,
    public facade: ItemsFacade,
    public dialogService: DialogService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  editDialog() {
    const initialState = this.item;

    let dialog = { component: EditFormComponent, title: 'Edit Item' };

    this.dialogService.open(
      dialog.component,
      plannerDialogConfig(this.themeService.theme, {
        header: dialog.title,
        width: '640px',
        breakpoints: {
          '960px': '90vw',
        },
        data: initialState,
      })
    );
  }

  openFocusMode() {
    this.router.navigate(['/focus'], {
      queryParams: { taskId: this.item.id },
    });
  }
}

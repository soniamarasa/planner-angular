import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';

import { ThemeService } from '../../services/theme.service';
import { DateService } from 'src/app/services/date.service';

import { UserFacade } from '../../facades/user.facades';
import { ItemsFacade } from 'src/app/facades/items.facade';

import { Item } from 'src/app/models/item';

import { FormDialogComponent } from '../../components/form-dialog/form-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  weekDay: any;

  public items$: Observable<Item[]> | undefined;

  constructor(
    public _dialogService: DialogService,
    public facade: ItemsFacade,
    public date: DateService,
    private userFacade: UserFacade,
    public themeService: ThemeService
  ) {}

  ngOnInit(): any {
    this.weekDay = this.date.weekDay.toLowerCase();
    this.userFacade.getIdUser()
  }

  newItem() {
    const ref = this._dialogService.open(FormDialogComponent, {
      header: 'New Item',
      width: 'max-content',
      styleClass: this.themeService.theme + ' modal',
    });
  }
}

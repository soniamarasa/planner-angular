import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';

import { ThemeService } from '../../services/theme.service';
import { DateService } from 'src/app/services/date.service';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { Item } from 'src/app/models/item';
import { FormDialogComponent } from '../../components/form-dialog/form-dialog.component';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  weekDay: any;

  public items$ = this.facade.itemsState$.pipe(
    map((state): Item[] => {
      return [...state.items].sort((a, b): number => {
        if (a.type && b.type)
          return a.type < b.type ? -1 : a.type > b.type ? 1 : 0;

        return 0;
      });
    })
  );

  constructor(
    public _dialogService: DialogService,
    private _router: Router,
    public facade: ItemsFacade,
    public date: DateService,
    public themeService: ThemeService
  ) {
    this._router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): any {
    this.weekDay = this.date.weekDay.toLowerCase();
  }

  newItem() {
    const ref = this._dialogService.open(FormDialogComponent, {
      header: 'New Item',
      width: 'max-content',
      styleClass: this.themeService.theme + ' modal',
    });
  }

  ngOnDestroy(): any {
    this.facade.cleanItems();
  }
}

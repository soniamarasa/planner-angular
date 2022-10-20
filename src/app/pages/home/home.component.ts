import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { SubSink } from 'subsink';

import { ThemeService } from '../../services/theme.service';
import { DateService } from 'src/app/services/date.service';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { Item } from 'src/app/models/item';
import { FormDialogComponent } from '../../components/form-dialog/form-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  subs = new SubSink();
  weekDay: any;
  items: Item[] = [];

  public items$ = this.facade.itemsState$.pipe(
    map((state) => {
      return state.items.sort((a, b): any => {
        if (a.type && b.type)
          return a.type < b.type ? -1 : a.type > b.type ? 1 : 0;
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
    this.facade.init();
    this._router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): any {
    this.weekDay = this.date.weekDay.toLowerCase();

    this.subs.add(
      this.items$.subscribe((items) => {
        this.items = items;
        // if (items.length) {
        //   const userId = items[0].userId;
        //   const userIdStorage = JSON.parse(
        //     localStorage.getItem('idUser') as string
        //   );

        //   if (userId === userIdStorage) {
        //     this.items = items;
        //   }
        // } else {
        //   this.items = [];
        // }
      })
    );
    
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

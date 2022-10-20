import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubSink } from 'subsink';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { ThemeService } from 'src/app/services/theme.service';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { UserFacade } from 'src/app/facades/user.facades';

import { FormDialogComponent } from '../form-dialog/form-dialog.component';
import { ChartComponent } from '../chart/chart.component';

import { Dropdown } from 'src/app/models/dropdown';

@Component({
  selector: 'app-actions-planner',
  templateUrl: './actions-planner.component.html',
  styleUrls: ['./actions-planner.component.scss'],
})
export class ActionsPlannerComponent implements OnInit {
  subs = new SubSink();
  themes: Dropdown[];
  leftTooltipItems: any;
  theme: boolean = false;

  constructor(
    public _dialogService: DialogService,
    private _confirmationService: ConfirmationService,
    private _messageService: MessageService,
    private _router: Router,
    private facade: ItemsFacade,
    private userFacade: UserFacade,
    public themeService: ThemeService
  ) {
    this.themes = [
      { name: 'Tema 01', code: 'theme01' },
      { name: 'Tema 02', code: 'theme02' },
      { name: 'Tema 03', code: 'theme03' },
      { name: 'Tema 04', code: 'theme04' },
      { name: 'Tema 05', code: 'theme05' },
      { name: 'Tema 06', code: 'theme06' },
    ];
  }

  showDialog(type: any) {
    let dialog: { component: any; title: string };
    if (type === 'New') {
      dialog = { component: FormDialogComponent, title: 'New Item' };
    } else {
      dialog = { component: ChartComponent, title: 'Statistics - Tasks' };
    }
    const ref = this._dialogService.open(dialog.component, {
      header: dialog.title,
      width: 'max-content',
      styleClass: this.themeService.theme + ' modal',
    });
  }

  confirm() {
    this._confirmationService.confirm({
      message:
        'Are you sure you want to reset the Week? All data will be erased!',
      accept: () => this.reset(),
    });
  }

  themeModal() {
    this.theme = true;
  }

  reset() {
    this.facade.resetData();
  }

  ngOnInit(): void {
    this.leftTooltipItems = [
      {
        tooltipOptions: {
          tooltipLabel: 'Statistics',
          tooltipPosition: 'left',
        },
        icon: 'pi pi-chart-bar',
        command: () => {
          this.showDialog('Chart');
        },
      },
      {
        tooltipOptions: {
          tooltipLabel: 'Reset the Week?',
          tooltipPosition: 'left',
        },
        icon: 'pi pi-refresh',
        command: () => {
          this.confirm();
        },
      },
      {
        tooltipOptions: {
          tooltipLabel: 'My Account',
          tooltipPosition: 'left',
        },
        icon: 'pi pi-user',
        command: () => {
          this._router.navigate(['/account']);
        },
      },
      {
        tooltipOptions: {
          tooltipLabel: 'Theme',
          tooltipPosition: 'left',
        },
        icon: 'pi pi-palette',
        command: () => {
          this.themeModal();
        },
      },
      {
        tooltipOptions: {
          tooltipLabel: 'Logout',
          tooltipPosition: 'left',
        },
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        },
      },
    ];
  }

  logout() {
    this.subs.add(
      this.userFacade.logout().subscribe({
        next: () => {
          this.themeService.theme = 'theme01';
          this._router.navigate(['/auth']);
        },
        error: () =>
          this._messageService.add({
            key: 'notification',
            severity: 'error',
            detail: 'Unable to log out of your account.',
            icon: 'fa-solid fa-check',
          }),
      })
    );
  }

  changeTheme(e: any): any {
    this.themeService.theme = e;
    this.themeService.setTheme(this.themeService.theme);
  }
}

import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ThemeService } from 'src/app/services/theme.service';
import { ItemsService } from 'src/app/services/items.service';
import { FormDialogComponent } from '../form-dialog/form-dialog.component';
import { ChartComponent } from '../chart/chart.component';

interface Theme {
  name: string;
  code: string;
}

@Component({
  selector: 'app-actions-planner',
  templateUrl: './actions-planner.component.html',
  styleUrls: ['./actions-planner.component.scss'],
})
export class ActionsPlannerComponent implements OnInit {
  themes: Theme[];
  leftTooltipItems: any;
  theme: boolean = false;

  constructor(
    public dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private itemService: ItemsService,
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
      dialog = { component: FormDialogComponent, title: 'Novo Item' };
    } else {
      dialog = { component: ChartComponent, title: 'Estatísticas' };
    }
    const ref = this.dialogService.open(dialog.component, {
      header: dialog.title,
      width: '70%',
    });
  }

  confirm() {
    this.confirmationService.confirm({
      message:
        'Você term certeza que deseja resetar a Semana? Todos os dados serão apagados!',
      accept: () => {
        console.log('YES');
      },
    });
  }

  themeModal() {
    this.theme = true;
  }

  ngOnInit(): void {
    this.leftTooltipItems = [
      {
        tooltipOptions: {
          tooltipLabel: 'Novo Item',
          tooltipPosition: 'left',
        },
        icon: 'pi pi-plus',
        command: () => {
          this.showDialog('New');
        },
      },
      {
        tooltipOptions: {
          tooltipLabel: 'Estatísticas',
          tooltipPosition: 'left',
        },
        icon: 'pi pi-chart-bar',
        command: () => {
          this.showDialog('Chart');
        },
      },
      {
        tooltipOptions: {
          tooltipLabel: 'Alterar Tema',
          tooltipPosition: 'left',
        },
        icon: 'pi pi-palette',
        command: () => {
          this.themeModal();
        },
      },
      {
        tooltipOptions: {
          tooltipLabel: 'Resetar a Semana?',
          tooltipPosition: 'left',
        },
        icon: 'pi pi-refresh',
        command: () => {
          this.confirm();
        },
      },
    ];
  }

  changeTheme(e: any): any {
    console.log(e);
    this.themeService.theme = e;
    this.themeService.setTheme(this.themeService.theme);
  }
}

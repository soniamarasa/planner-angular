import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { filter } from 'rxjs';
import { SubSink } from 'subsink';

import { UserFacade } from 'src/app/facades/user.facades';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { DateService } from 'src/app/services/date.service';
import { ThemeService } from 'src/app/services/theme.service';
import { plannerDialogStyleClass } from 'src/app/utils/planner-dialog.util';
import { UserService } from '../../services/user.service';
import { getGravatarUrl } from 'src/app/utils/gravatar.util';
import { Dropdown } from 'src/app/models/dropdown';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  todayIs = '';
  userFirstName = '';
  userEmail = '';
  gravatarUrl = '';
  isPlannerHome = true;
  isAccount = false;
  isProjects = false;
  isFocus = false;
  isDashboard = false;
  themeVisible = false;
  themes: Dropdown[] = [
    { name: 'Light', code: 'theme-light' },
    { name: 'Dark', code: 'theme-dark' },
  ];
  userMenuItems: MenuItem[] = [];
  private readonly subs = new SubSink();

  get dialogStyleClass(): string {
    return plannerDialogStyleClass(this.themeService.theme);
  }

  constructor(
    private dateService: DateService,
    private userService: UserService,
    private userFacade: UserFacade,
    private itemsFacade: ItemsFacade,
    private router: Router,
    public themeService: ThemeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.userFacade.user = this.userService.get('auth')?.user;
    this.userFirstName = this.userFacade.user?.name?.split(' ')?.[0] ?? '';
    this.userEmail = this.userFacade.user?.email ?? '';
    this.gravatarUrl = getGravatarUrl(this.userEmail, 80);
    this.todayIs = this.dateService.today();
    this.buildUserMenu();
    this.updateRouteFlags();

    this.subs.sink = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateRouteFlags());
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get pageTitle(): string {
    if (this.isAccount) {
      return 'My account';
    }
    if (this.isProjects) {
      return 'Projects';
    }
    if (this.isFocus) {
      return 'Focus Mode';
    }
    if (this.isDashboard) {
      return 'Dashboard';
    }
    return 'Weekly Planner';
  }

  private buildUserMenu(): void {
    this.userMenuItems = [
      {
        label: 'My account',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/account']),
      },
      {
        label: 'Theme',
        icon: 'pi pi-palette',
        command: () => {
          this.themeVisible = true;
        },
      },
      { separator: true },
      {
        label: 'Sign out',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
    ];
  }

  private updateRouteFlags(): void {
    const url = this.router.url.split('?')[0];
    this.isPlannerHome = url === '/' || url === '';
    this.isAccount = url.startsWith('/account');
    this.isProjects = url.startsWith('/projects');
    this.isFocus = url.startsWith('/focus');
    this.isDashboard = url.startsWith('/dashboard');
  }

  confirmClearWeek(): void {
    this.confirmationService.confirm({
      message: 'Clear all scheduled items for this week? Notes and To do remain.',
      header: 'Clear this week?',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => this.itemsFacade.clearWeek(),
    });
  }

  changeTheme(theme: string): void {
    this.themeService.setTheme(theme);
  }

  logout(): void {
    this.subs.sink = this.userFacade.logout().subscribe({
      next: () => {
        this.themeService.applyTheme('theme-light');
        this.router.navigate(['/auth']);
      },
      error: () =>
        this.messageService.add({
          key: 'notification',
          severity: 'error',
          detail: 'Could not sign out.',
        }),
    });
  }
}

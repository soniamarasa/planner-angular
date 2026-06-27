import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { ChartModule } from 'primeng/chart';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';

import { ProjectsService } from '../services/projects.service';
import { ItemsService } from '../services/items.service';
import { DateService } from '../services/date.service';
import { FocusService } from '../services/focus.service';
import { FocusFacade } from '../facades/focus.facade';
import { ItemsFacade } from '../facades/items.facade';
import { LoadingFacade } from '../facades/loading.facade';
import { UserFacade } from '../facades/user.facades';
import { ItemsStore } from '../stores/items.store';
import { ItemSearchStore } from '../stores/item-search.store';

import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';

import { AuthComponent } from './auth/auth.component';
import { RegistrationComponent } from './registration/registration.component';
import { PasswordRecoverComponent } from './password-recover/password-recover.component';
import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { FocusComponent } from './focus/focus.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsShellComponent } from './projects/projects-shell.component';
import { ProjectsListComponent } from './projects/projects-list.component';
import { ProjectDetailComponent } from './projects/project-detail.component';
import { NotFoundComponent } from './not-found/not-found.component';

import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';

import { CardComponent } from '../components/card/card.component';
import { ChartComponent } from '../components/chart/chart.component';
import { UserImgComponent } from '../components/user-img/user-img.component';
import { ActionsItemComponent } from '../components/actions-item/actions-item.component';
import { FormDialogComponent } from '../components/form-dialog/form-dialog.component';
import { EditFormComponent } from '../components/edit-form/edit-form.component';
import { WeekNavComponent } from '../components/week-nav/week-nav.component';
import { OverduePanelComponent } from '../components/overdue-panel/overdue-panel.component';
import { ProjectFormDialogComponent } from '../components/project-form-dialog/project-form-dialog.component';
import { RecoverDialogComponent } from './auth/recover-dialog/recover-dialog.component';
import { WeekStore } from '../stores/week.store';

@NgModule({
  declarations: [
    PagesComponent,
    AuthComponent,
    RecoverDialogComponent,
    RegistrationComponent,
    PasswordRecoverComponent,
    AccountComponent,
    HomeComponent,
    FocusComponent,
    DashboardComponent,
    NotFoundComponent,

    HeaderComponent,
    FooterComponent,

    CardComponent,
    ChartComponent,
    UserImgComponent,
    ActionsItemComponent,
    FormDialogComponent,
    EditFormComponent,
    WeekNavComponent,
    OverduePanelComponent,
    ProjectFormDialogComponent,
    ProjectsShellComponent,
    ProjectsListComponent,
    ProjectDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DatePickerModule,
    DividerModule,
    MenuModule,
    TooltipModule,
    DialogModule,
    DynamicDialogModule,
    ConfirmDialogModule,
    SelectModule,
    InputTextModule,
    PasswordModule,
    MultiSelectModule,
    CheckboxModule,
    ToastModule,
    MessageModule,
    ChartModule,
    SliderModule,
    InputNumberModule,

    TranslatePipe,
    TranslateDirective,

    // --- Pages Routing ---
    PagesRoutingModule,
  ],
  providers: [
    ItemsStore,
    ItemSearchStore,
    WeekStore,
    ItemsService,
    ProjectsService,
    FocusService,
    DateService,

    DialogService,
    ConfirmationService,
    MessageService,
    ItemsFacade,
    FocusFacade,
    UserFacade,
    LoadingFacade,
  ],
})
export class PagesModule {}

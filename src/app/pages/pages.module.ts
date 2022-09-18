import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { DividerModule } from 'primeng/divider';
import { SpeedDialModule } from 'primeng/speeddial';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ChartModule } from 'primeng/chart';

import { ItemsService } from '../services/items.service';
import { DateService } from '../services/date.service';
import { ThemeService } from '../services/theme.service';
import { ItemsFacade } from '../facades/items.facade';

import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';

import { AuthComponent } from './auth/auth.component';
import { RegistrationComponent } from './registration/registration.component';
import { PasswordRecoverComponent } from './password-recover/password-recover.component';
import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { NotFoundComponent } from './not-found/not-found.component';

import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';

import { CardComponent } from '../components/card/card.component';
import { ChartComponent } from '../components/chart/chart.component';
import { ActionsPlannerComponent } from '../components/actions-planner/actions-planner.component';
import { ActionsItemComponent } from '../components/actions-item/actions-item.component';
import { DialogComponent } from '../components/dialog/dialog.component';
import { FormDialogComponent } from '../components/form-dialog/form-dialog.component';
import { EditFormComponent } from '../components/edit-form/edit-form.component';
import { ItemsStore } from '../stores/items.store';
import { LoadingFacade } from '../facades/loading.facade';
import { ItemSearchStore } from '../stores/item-search.store';
import { RecoverDialogComponent } from './auth/recover-dialog/recover-dialog.component';

@NgModule({
  declarations: [
    PagesComponent,
    AuthComponent,
    RecoverDialogComponent,
    RegistrationComponent,
    PasswordRecoverComponent,
    AccountComponent,
    HomeComponent,
    NotFoundComponent,

    HeaderComponent,
    FooterComponent,

    CardComponent,
    ChartComponent,
    DialogComponent,
    ActionsPlannerComponent,
    ActionsItemComponent,
    FormDialogComponent,
    EditFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    CalendarModule,
    DividerModule,
    SpeedDialModule,
    TooltipModule,
    DialogModule,
    DynamicDialogModule,
    ConfirmDialogModule,
    DropdownModule,
    InputTextModule,
    PasswordModule,
    MultiSelectModule,
    CheckboxModule,
    ToastModule,
    MessageModule,
    MessagesModule,
    ChartModule,

    // --- Pages Routing ---
    PagesRoutingModule,
  ],
  providers: [
    ItemsStore,
    ItemSearchStore,
    ItemsService,
    DateService,
    ThemeService,
    ItemsFacade,
    DialogService,
    ConfirmationService,
    MessageService,
    LoadingFacade,
  ],
  bootstrap: [PagesComponent],
})
export class PagesModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { SpeedDialModule } from 'primeng/speeddial';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import {ChartModule} from 'primeng/chart';

import { ItemsService } from './services/items.service';
import { DateService } from './services/date.service';
import { ThemeService } from './services/theme.service';
import { ItemsFacade } from './facades/items.facade';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { BodyComponent } from './components/body/body.component';
import { FooterComponent } from './components/footer/footer.component';
import { CardComponent } from './components/card/card.component';
import { ChartComponent } from './components/chart/chart.component';
import { ActionsPlannerComponent } from './components/actions-planner/actions-planner.component';
import { ActionsItemComponent } from './components/actions-item/actions-item.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { FormDialogComponent } from './components/form-dialog/form-dialog.component';
import { EditFormComponent } from './components/edit-form/edit-form.component';
import { ItemsStore } from './stores/items.store';
import { LoadingFacade } from './facades/loading.facade';
import { ItemSearchStore } from './stores/item-search.store';



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    BodyComponent,
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
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ButtonModule,
    CardModule,
    CalendarModule,
    SpeedDialModule,
    TooltipModule,
    DialogModule,
    DynamicDialogModule,
    ConfirmDialogModule,
    DropdownModule,
    InputTextModule,
    MultiSelectModule,
    CheckboxModule,
    ToastModule,
    MessageModule,
    MessagesModule,
    ChartModule
  
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
  bootstrap: [AppComponent],
})
export class AppModule {}

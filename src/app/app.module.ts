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
import { CardDayComponent } from './components/card-day/card-day.component';
import { FormDialogComponent } from './components/form-dialog/form-dialog.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

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
    CardDayComponent,
    FormDialogComponent,
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
  ],
  providers: [
    ItemsService,
    DateService,
    ThemeService,
    ItemsFacade,
    DialogService,
    ConfirmationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ItemsService } from './services/items.service';
import { DateService } from './services/date.service';
import { ThemeService } from './services/theme.service';

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [ItemsService, DateService, ThemeService],
  bootstrap: [AppComponent],
})
export class AppModule {}

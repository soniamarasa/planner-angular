import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { DateService } from 'src/app/services/date.service';
import { Item } from '../../models/item';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit, OnDestroy {
  weekDay: any;

  @Input() items: Item[] = [];
  @Input() titleBox: string | undefined;
  @Input() day: string | undefined;
  @Input() box: string | undefined;
  value: Date | undefined;

  constructor(public facade: ItemsFacade, public date: DateService) {}

  ngOnInit(): void {
    this.day = this.day?.toLowerCase();
    this.weekDay = this.date.wD.toLowerCase();
  }

  ngOnDestroy(): void {}
}

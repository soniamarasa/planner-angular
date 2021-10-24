import { Component, Input, OnInit } from '@angular/core';
import { ItemsFacade } from 'src/app/facades/items.facade';

@Component({
  selector: 'app-card-day',
  templateUrl: './card-day.component.html',
  styleUrls: ['./card-day.component.scss'],
})
export class CardDayComponent implements OnInit {
  @Input() day: string | undefined;
  @Input() box: string | undefined;

  constructor(public facade: ItemsFacade) {}

  ngOnInit(): void {
    this.facade.getAll(this.box);
  }
}

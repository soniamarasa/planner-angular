import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { DateService } from 'src/app/services/date.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  items$ = this.facade.itemsState$.pipe(map((state) => state.items));

  weekDay: any;

  @Input() titleBox: string | undefined;
  @Input() day: string | undefined;
  @Input() box: string | undefined;
  value: Date | undefined;

  constructor(public facade: ItemsFacade, public date: DateService) {}

  ngOnInit(): void {
    this.day = this.day?.toLowerCase();
    this.weekDay = this.date.wD.toLowerCase();
  }
}

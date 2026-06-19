import { Component } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { Item } from 'src/app/models/item';

@Component({
  selector: 'app-overdue-panel',
  standalone: false,
  templateUrl: './overdue-panel.component.html',
  styleUrls: ['./overdue-panel.component.scss'],
})
export class OverduePanelComponent {
  readonly overdueItems$ = this.facade.overdueItems$;

  constructor(public facade: ItemsFacade) {}

  formatOriginalDate(item: Item): string {
    if (!item.scheduled_date) {
      return '';
    }
    return format(parseISO(item.scheduled_date), 'EEE, d MMM');
  }

  moveToToday(item: Item, event: Event): void {
    event.stopPropagation();
    this.facade.rescheduleToToday(item);
  }

  openActions(item: Item): void {
    this.facade.actionsControl(item.id, null, null, null);
  }
}

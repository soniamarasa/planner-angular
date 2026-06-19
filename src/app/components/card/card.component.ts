import { Component, Input, OnInit } from '@angular/core';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { Item } from '../../models/item';
import { format, parseISO } from 'date-fns';
import { projectIconClass } from 'src/app/utils/project-icon.util';

@Component({
  selector: 'app-card',
  standalone: false,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() items: Item[] = [];
  @Input() titleBox: string | undefined;
  @Input() day: string | undefined;
  @Input() box: string | undefined;
  @Input() columnDateKey: string | undefined;
  @Input() columnDateLabel: string | undefined;
  @Input() isTodayColumn = false;

  value: Date | undefined;

  constructor(public facade: ItemsFacade) {}

  ngOnInit(): void {
    this.day = this.day?.toLowerCase();
  }

  matchesItem(item: Item): boolean {
    if (!this.box) {
      return false;
    }

    if (this.box === 'todo' || this.box === 'notes') {
      return item.where === this.box;
    }

    if (this.columnDateKey) {
      return item.scheduled_date === this.columnDateKey;
    }

    return item.where === this.box;
  }

  formatCarriedFrom(item: Item): string {
    if (!item.carried_from) {
      return '';
    }
    return format(parseISO(item.carried_from), 'd MMM');
  }

  projectIconClass(icon?: string | null): string {
    return projectIconClass(icon);
  }
}

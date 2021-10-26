import { Component, Input, OnInit } from '@angular/core';
import { ItemsFacade } from 'src/app/facades/items.facade';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() title: string | undefined;
  @Input() day: string | undefined;
  @Input() box: string | undefined;
  value: Date | undefined;

  constructor(public facade: ItemsFacade) { }

  ngOnInit(): void {
    this.facade.getAll(this.box);
  }

}

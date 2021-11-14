import { Component, Input, OnInit } from '@angular/core';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { ItemsService } from 'src/app/services/items.service';

@Component({
  selector: 'app-actions-item',
  templateUrl: './actions-item.component.html',
  styleUrls: ['./actions-item.component.scss']
})
export class ActionsItemComponent implements OnInit {
  @Input() type!: any;
  @Input() description!: any;
  @Input() obs!: any;
  @Input() where: any;
  @Input() id: any;
  @Input() finished!: boolean;
  @Input() started!: boolean;
  @Input() canceled!: boolean;
  @Input() important!: boolean;

  constructor(public service: ItemsService, public facade: ItemsFacade) { }

  ngOnInit(): void {
  }

}



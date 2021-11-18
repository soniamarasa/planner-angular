import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { Item } from 'src/app/models/item';
import { DateService } from 'src/app/services/date.service';
import { ItemsService } from 'src/app/services/items.service';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss'],
})
export class BodyComponent implements OnInit {
  weekDay: any

  public items$: Observable<Item[]> | undefined;

  constructor(public facade: ItemsFacade, public date: DateService) {
  }

  ngOnInit(): any {
    this.weekDay = this.date.weekDay.toLowerCase();
    // this.facade.getAllItems();
  }
  

  teste() {
 
  }
}

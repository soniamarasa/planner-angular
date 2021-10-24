import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { Item } from 'src/app/models/item';
import { ItemsService } from 'src/app/services/items.service';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss'],
})
export class BodyComponent implements OnInit {

  public items$: Observable<Item[]> | undefined;

  constructor(public facade: ItemsFacade) {
  }

  ngOnInit(): any {
    // this.items$ = this.
    this.facade.getAllItems();
  }
  

  teste() {
 
  }
}

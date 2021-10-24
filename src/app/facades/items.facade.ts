import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Item } from '../models/item';
import { ItemsService } from '../services/items.service';

@Injectable()
export class ItemsFacade {
  constructor(private service: ItemsService) {}

  
}

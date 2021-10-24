import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-day',
  templateUrl: './card-day.component.html',
  styleUrls: ['./card-day.component.scss']
})
export class CardDayComponent implements OnInit {

  @Input() day: string | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}

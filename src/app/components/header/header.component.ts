import { Component, OnInit } from '@angular/core';
import { DateService } from 'src/app/services/date.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  todayIs: any;

  constructor(private dateService: DateService) { }

  ngOnInit(): void {
    this.todayIs = this.dateService.today();
  }

}

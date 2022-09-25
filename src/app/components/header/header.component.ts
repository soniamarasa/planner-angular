import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserFacade } from 'src/app/facades/user.facades';
import { DateService } from 'src/app/services/date.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  todayIs: any;
  user = this.userFacade?.user;
  isHome = window.location.pathname === '/' ? true : false
  userName = this.user.name.split(' ');

  constructor(
    private _route: ActivatedRoute,
    private dateService: DateService,
    private userFacade: UserFacade
  ) {}

  ngOnInit(): void {
    this.todayIs = this.dateService.today();
  }
}

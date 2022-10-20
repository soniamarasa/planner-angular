import { Component, OnInit } from '@angular/core';
import { UserFacade } from 'src/app/facades/user.facades';
import { DateService } from 'src/app/services/date.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  todayIs: any;
  isHome = window.location.pathname === '/' ? true : false;
  userName = '';

  constructor(
    private dateService: DateService,
    private userService: UserService,
    private userFacade: UserFacade
  ) {}

  ngOnInit(): void {
    this.userFacade.user = this.userService.get('auth')?.user;
    this.userName = this.userFacade.user?.name?.split(' ');
    this.todayIs = this.dateService.today();
  }
}

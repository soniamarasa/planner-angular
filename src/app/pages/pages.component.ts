import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
})
export class PagesComponent {
  title = 'planner-angular';

  constructor(public themeService: ThemeService) {
    window.location.pathname === '/auth';

    if (!this.themeService.getTheme()) {
      this.themeService.theme = 'theme01';
    } else {
      window.location.pathname === '/auth'
        ? (this.themeService.theme = 'theme01')
        : (this.themeService.theme = this.themeService.getTheme());
    }
  }
}

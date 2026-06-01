import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-pages',
  standalone: false,
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
})
export class PagesComponent {
  title = 'planner-angular';

  constructor(public themeService: ThemeService) {
    window.location.pathname === '/auth';
    const storedTheme = this.themeService.getTheme();
    this.themeService.theme =
      window.location.pathname === '/auth' ? 'theme-light' : storedTheme;
  }
}

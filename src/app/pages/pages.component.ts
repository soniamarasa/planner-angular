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
    const storedTheme = this.themeService.getTheme();
    this.themeService.applyTheme(
      window.location.pathname === '/auth' ? 'theme-light' : storedTheme
    );
  }
}

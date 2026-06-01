import { Component } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'planner-angular';

  constructor(public themeService: ThemeService) {
    const storedTheme = this.themeService.getTheme();
    this.themeService.theme =
      window.location.pathname === '' || window.location.pathname === '/account'
        ? storedTheme
        : 'theme-light';
  }
}

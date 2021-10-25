import { Component } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'planner-angular';

  constructor(public themeService: ThemeService) {
    if (!this.themeService.getTheme()) {
      this.themeService.theme = 'theme01';
    } else {
      this.themeService.theme = this.themeService.getTheme();
    }
  }
}

import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from './services/theme.service';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'planner-angular';

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private languageService: LanguageService,
  ) {
    this.updateThemeByRoute(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigation = event as NavigationEnd;
        this.updateThemeByRoute(navigation.urlAfterRedirects || navigation.url);
      });
  }

  private updateThemeByRoute(url: string) {
    const currentPath = (url || '').split('?')[0] || '/';
    const isAuthRoute = currentPath === '/auth';
    const storedTheme = this.themeService.getTheme();

    this.themeService.applyTheme(isAuthRoute ? 'theme-light' : storedTheme);
  }
}

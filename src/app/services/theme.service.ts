import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  theme = 'theme-light';

  constructor() {
    this.applyTheme(this.getTheme());
  }

  setTheme(currentTheme: string): void {
    this.applyTheme(currentTheme);
  }

  applyTheme(theme: string): void {
    const nextTheme = theme === 'theme-dark' ? 'theme-dark' : 'theme-light';
    this.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);

    if (typeof document !== 'undefined') {
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(nextTheme);
    }
  }

  getTheme(): string {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'theme-dark' ? 'theme-dark' : 'theme-light';
  }
}

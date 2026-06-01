import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = 'theme-light';

  setTheme(currentTheme: string): any {
    localStorage.setItem('theme', currentTheme);
  }

  getTheme(): any {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'theme-dark' ? 'theme-dark' : 'theme-light';
  }

  constructor() { }
}

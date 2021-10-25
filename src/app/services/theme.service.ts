import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = "theme01"

  setTheme(currentTheme: string): any {
    localStorage.setItem("theme", currentTheme);
  }

  getTheme():any {
    return localStorage.getItem('theme')
  }

  constructor() { }
}

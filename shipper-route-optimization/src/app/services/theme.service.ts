import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'routeflow-theme';
  isDarkMode = signal<boolean>(this.loadTheme());

  constructor() {
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode.set(!this.isDarkMode());
    this.saveTheme(this.isDarkMode());
    this.applyTheme();
  }

  private loadTheme(): boolean {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference if no saved theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private saveTheme(isDark: boolean): void {
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
  }

  private applyTheme(): void {
    const htmlElement = document.documentElement;
    if (this.isDarkMode()) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }
}

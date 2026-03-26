import { Injectable, signal, PLATFORM_ID, inject, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private storageKey = 'moviestreet_theme';
  
  theme = signal<'dark' | 'light'>(this.loadTheme());

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const theme = this.theme();
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.storageKey, theme);
      }
    });
  }

  private loadTheme(): 'dark' | 'light' {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved === 'light' || saved === 'dark') return saved;
      
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  }

  toggle() {
    this.theme.update(current => current === 'dark' ? 'light' : 'dark');
  }
}

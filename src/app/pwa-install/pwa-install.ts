import { Component, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-pwa-install',
  imports: [],
  templateUrl: './pwa-install.html',
  styleUrl: './pwa-install.css',
})
export class PwaInstall {
  private platformId = inject(PLATFORM_ID);
  showPrompt = signal(false);
  private deferredPrompt: any;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.showPrompt.set(true);
      });
    }
  }

  async installApp() {
    if (!this.deferredPrompt) return;
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      this.showPrompt.set(false);
    }
    this.deferredPrompt = null;
  }

  dismissPrompt() {
    this.showPrompt.set(false);
  }
}

import { Component, signal } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
  selector: 'app-loading-bar',
  imports: [],
  templateUrl: './loading-bar.html',
  styleUrl: './loading-bar.css',
})
export class LoadingBar {
  isLoading = signal(false);

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => this.isLoading.set(false), 300);
      }
    });
  }
}

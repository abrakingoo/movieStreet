import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-back-to-top',
  imports: [],
  templateUrl: './back-to-top.html',
  styleUrl: './back-to-top.css',
})
export class BackToTop {
  showButton = signal(false);

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showButton.set(window.scrollY > 300);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

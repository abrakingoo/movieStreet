import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Movie } from '../models/tmdb.types';
import { ToastService } from '../core/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private storageKey = 'moviestreet_bookmarks';
  private platformId = inject(PLATFORM_ID);
  private toast = inject(ToastService);
  bookmarks = signal<Movie[]>(this.loadFromStorage());

  private loadFromStorage(): Movie[] {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    }
    return [];
  }

  private saveToStorage(bookmarks: Movie[]) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, JSON.stringify(bookmarks));
    }
  }

  toggleBookmark(movie: Movie) {
    const current = this.bookmarks();
    const index = current.findIndex(m => m.id === movie.id);
    
    if (index > -1) {
      current.splice(index, 1);
      this.toast.info(`Removed from watchlist`);
    } else {
      current.push(movie);
      this.toast.success(`Added to watchlist`);
    }
    
    this.bookmarks.set([...current]);
    this.saveToStorage(this.bookmarks());
  }

  isBookmarked(id: number): boolean {
    return this.bookmarks().some(m => m.id === id);
  }
}

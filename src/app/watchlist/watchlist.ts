import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BookmarkService } from '../services/bookmark';
import { Movie } from '../models/tmdb.types';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-watchlist',
  imports: [FormsModule],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.css',
})
export class Watchlist {
  private router = inject(Router);
  bookmarkService = inject(BookmarkService);
  
  sortBy = signal<string>('added');
  filterType = signal<string>('all');
  
  filteredBookmarks = computed(() => {
    let items = [...this.bookmarkService.bookmarks()];
    
    // Filter by type
    if (this.filterType() !== 'all') {
      items = items.filter(item => item.media_type === this.filterType());
    }
    
    // Sort
    switch(this.sortBy()) {
      case 'title':
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        items.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case 'year':
        items.sort((a, b) => {
          const yearA = a.release_date || '';
          const yearB = b.release_date || '';
          return yearB.localeCompare(yearA);
        });
        break;
      // 'added' - keep original order (most recent first)
    }
    
    return items;
  });

  viewDetails(item: Movie) {
    this.router.navigate(['/details', item.media_type, item.id]).then(() => window.scrollTo(0, 0));
  }

  removeBookmark(item: Movie, event: Event) {
    event.stopPropagation();
    this.bookmarkService.toggleBookmark(item);
  }
}

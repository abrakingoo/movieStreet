import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { SearchService } from '../services/search';
import { Movie, TVShow } from '../models/tmdb.types';
import { ActivatedRoute, Router } from '@angular/router';
import { BookmarkService } from '../services/bookmark';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  imports: [SlicePipe, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {
  private searchService = inject(SearchService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  bookmarkService = inject(BookmarkService);
  
  allResults = this.searchService.searchResults;
  isLoading = this.searchService.isSearching;
  currentPage = this.searchService.currentPage;
  totalPages = this.searchService.totalPages;
  currentQuery = '';
  
  sortBy = signal<string>('popularity');
  filterType = signal<string>('all');
  minRating = signal<number>(0);
  isLoadingMore = signal(false);
  
  searchResults = computed(() => {
    let results = [...this.allResults()];
    
    // Filter by type
    if (this.filterType() !== 'all') {
      results = results.filter(item => item.media_type === this.filterType());
    }
    
    // Filter by rating
    if (this.minRating() > 0) {
      results = results.filter(item => item.vote_average >= this.minRating());
    }
    
    // Sort
    switch(this.sortBy()) {
      case 'rating':
        results.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case 'title':
        results.sort((a, b) => {
          const titleA = 'name' in a ? a.name : a.title;
          const titleB = 'name' in b ? b.name : b.title;
          return titleA.localeCompare(titleB);
        });
        break;
      case 'year':
        results.sort((a, b) => {
          const yearA = 'first_air_date' in a ? a.first_air_date : a.release_date;
          const yearB = 'first_air_date' in b ? b.first_air_date : b.release_date;
          return yearB.localeCompare(yearA);
        });
        break;
      default: // popularity
        results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
    
    return results;
  });

  @HostListener('window:scroll')
  onScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;
    
    if (scrollPosition >= pageHeight - 500 && !this.isLoadingMore() && !this.isLoading() && this.currentPage() < this.totalPages()) {
      this.loadMore();
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const query = params['query'];
      const page = parseInt(params['page']) || 1;
      if (query) {
        this.currentQuery = query;
        this.searchService.handleSearch(query, page);
      }
    });
  }

  loadMore() {
    if (this.currentQuery && this.currentPage() < this.totalPages()) {
      this.isLoadingMore.set(true);
      const nextPage = this.currentPage() + 1;
      this.searchService.handleSearch(this.currentQuery, nextPage, true);
      setTimeout(() => this.isLoadingMore.set(false), 1000);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      window.location.href = `/search?query=${encodeURIComponent(this.currentQuery)}&page=${page}`;
    }
  }

  viewDetails(movie: Movie | TVShow) {
    const type = movie.media_type === 'tv' ? 'tv' : 'movie';
    this.router.navigate(['/details', type, movie.id]).then(() => {
      window.scrollTo(0, 0);
    });
  }

  toggleBookmark(movie: Movie | TVShow, event: Event) {
    event.stopPropagation();
    this.bookmarkService.toggleBookmark(movie as Movie);
  }
}

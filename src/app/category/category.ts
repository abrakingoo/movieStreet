import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movie';
import { Movie, TVShow } from '../models/tmdb.types';
import { BookmarkService } from '../services/bookmark';
import { FormsModule } from '@angular/forms';

type MediaItem = (Movie | TVShow) & { title: string; release_date: string; media_type: string };

@Component({
  selector: 'app-category',
  imports: [FormsModule],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category implements OnInit {
  private movieService = inject(MovieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  bookmarkService = inject(BookmarkService);
  
  results = signal<MediaItem[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  currentPage = signal(1);
  totalPages = signal(0);
  categoryTitle = '';
  currentCategory = '';
  sortBy = signal('popularity.desc');
  filterYear = signal('');

  ngOnInit() {
    this.route.url.subscribe(url => {
      const path = url[0]?.path || '';
      this.categoryTitle = this.getCategoryTitle(path);
      
      this.route.queryParams.subscribe(params => {
        const page = parseInt(params['page']) || 1;
        this.loadCategory(path, page);
      });
    });
  }

  getCategoryTitle(path: string): string {
    const titles: {[key: string]: string} = {
      'movies': 'Movies',
      'series': 'TV Series',
      'animation': 'Animation',
      'kdrama': 'K-Drama',
      'anime': 'Anime'
    };
    return titles[path] || path;
  }

  loadCategory(category: string, page: number) {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.currentPage.set(page);
    this.currentCategory = category;

    let mediaType: 'movie' | 'tv' = 'movie';
    const sortBy = this.getMappedSortBy(category);

    switch(category) {
      case 'movies':
        this.movieService.discoverMovies({ page, sort_by: sortBy }).subscribe({
          next: res => this.handleResponse(res, mediaType),
          error: () => this.handleError()
        });
        break;
      case 'series':
        mediaType = 'tv';
        this.movieService.discoverTV({ page, sort_by: sortBy }).subscribe({
          next: res => this.handleResponse(res, mediaType),
          error: () => this.handleError()
        });
        break;
      case 'animation':
        this.movieService.discoverMovies({ with_genres: 16, page, sort_by: sortBy }).subscribe({
          next: res => this.handleResponse(res, mediaType),
          error: () => this.handleError()
        });
        break;
      case 'kdrama':
        mediaType = 'tv';
        this.movieService.discoverTV({ with_origin_country: 'KR', page, sort_by: sortBy }).subscribe({
          next: res => this.handleResponse(res, mediaType),
          error: () => this.handleError()
        });
        break;
      case 'anime':
        mediaType = 'tv';
        this.movieService.discoverTV({ with_genres: 16, with_origin_country: 'JP', page, sort_by: sortBy }).subscribe({
          next: res => this.handleResponse(res, mediaType),
          error: () => this.handleError()
        });
        break;
      default:
        this.handleError();
    }
  }

  private getMappedSortBy(category: string): string {
    const sort = this.sortBy();
    const isTV = ['series', 'kdrama', 'anime'].includes(category);
    
    if (sort.startsWith('release_date')) {
      const direction = sort.endsWith('desc') ? 'desc' : 'asc';
      return isTV ? `first_air_date.${direction}` : `primary_release_date.${direction}`;
    }
    return sort;
  }

  private handleResponse(res: { results: (Movie | TVShow)[]; total_pages?: number }, mediaType: 'movie' | 'tv') {
    const items = res.results.map((item: Movie | TVShow) => {
      const isTV = 'name' in item;
      return {
        ...item,
        title: isTV ? (item as TVShow).name : (item as Movie).title,
        release_date: isTV ? (item as TVShow).first_air_date : (item as Movie).release_date,
        media_type: mediaType
      } as MediaItem;
    }).filter(item => item.poster_path);
    
    this.results.set(items);
    this.totalPages.set(res.total_pages || 0);
    this.isLoading.set(false);
  }

  private handleError() {
    this.isLoading.set(false);
    this.hasError.set(true);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page },
        queryParamsHandling: 'merge'
      });
    }
  }

  viewDetails(item: MediaItem) {
    this.router.navigate(['/details', item.media_type, item.id]).then(() => {
      window.scrollTo(0, 0);
    });
  }

  toggleBookmark(item: MediaItem, event: Event) {
    event.stopPropagation();
    this.bookmarkService.toggleBookmark(item as Movie);
  }
}

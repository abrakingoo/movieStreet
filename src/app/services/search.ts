import { Injectable, inject, signal } from '@angular/core';
import { Subject, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Movie, TVShow } from '../models/tmdb.types';
import { MovieService } from './movie';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private movieService = inject(MovieService);
  private searchQuery$ = new Subject<{query: string, page: number, append: boolean}>();
  
  searchResults = signal<(Movie | TVShow)[]>([]);
  isSearching = signal<boolean>(false);
  totalPages = signal<number>(0);
  currentPage = signal<number>(1);

  constructor() {
    this.searchQuery$.pipe(
      switchMap(({query, page, append}) => {
        if (query.trim().length === 0 || query.trim().length < 2) {
          this.searchResults.set([]);
          this.isSearching.set(false);
          this.totalPages.set(0);
          return of(null);
        }

        this.isSearching.set(true);
        this.currentPage.set(page);

        return forkJoin({
          movies: this.movieService.searchMovies(query, page),
          tv: this.movieService.searchTV(query, page),
          append: of(append)
        });
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          const movies = response.movies.results.map(m => ({
            ...m,
            media_type: 'movie' as const
          }));
          
          const tvShows = response.tv.results.map(tv => ({
            ...tv,
            title: tv.name,
            release_date: tv.first_air_date,
            media_type: 'tv' as const
          }));
          
          const combined = [...movies, ...tvShows]
            .filter(item => item.poster_path && item.title && item.release_date)
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 20);
          
          if (response.append) {
            this.searchResults.update(current => [...current, ...combined]);
          } else {
            this.searchResults.set(combined);
          }
          
          this.totalPages.set(Math.max(response.movies.total_pages || 0, response.tv.total_pages || 0));
        }
        this.isSearching.set(false);
      },
      error: () => {
        this.isSearching.set(false);
      }
    });
  }

  handleSearch(query: string, page: number = 1, append: boolean = false) {
    if (query.trim().length === 0) {
      this.clearSearch();
      return;
    }
    this.searchQuery$.next({query, page, append});
  }

  clearSearch() {
    this.searchResults.set([]);
    this.isSearching.set(false);
    this.totalPages.set(0);
    this.currentPage.set(1);
  }
}

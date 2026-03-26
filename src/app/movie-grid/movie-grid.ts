import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MovieService } from '../services/movie';
import { Movie } from '../models/tmdb.types';
import { Router } from '@angular/router';
import { BookmarkService } from '../services/bookmark';

@Component({
  selector: 'app-movie-grid',
  imports: [],
  templateUrl: './movie-grid.html',
  styleUrl: './movie-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieGrid implements OnInit {
  private movieService = inject(MovieService);
  private router = inject(Router);
  bookmarkService = inject(BookmarkService);
  movies: Movie[] = [];
  isLoading = signal(true);
  hasError = signal(false);

  ngOnInit() {
    this.movieService.getTrendingMovies().subscribe({
      next: response => {
        this.movies = response.results;
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
      }
    });
  }

  viewDetails(movie: Movie) {
    this.router.navigate(['/details', 'movie', movie.id]).then(() => {
      window.scrollTo(0, 0);
    });
  }

  toggleBookmark(movie: Movie, event: Event) {
    event.stopPropagation();
    this.bookmarkService.toggleBookmark({ ...movie, media_type: 'movie' });
  }
}

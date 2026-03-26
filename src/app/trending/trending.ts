import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { MovieService } from '../services/movie';
import { Movie } from '../models/tmdb.types';
import { MovieGrid } from '../movie-grid/movie-grid';
import { SeoService } from '../core/services/seo.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-trending',
  imports: [MovieGrid],
  templateUrl: './trending.html',
  styleUrl: './trending.css',
})
export class Trending implements OnInit, OnDestroy {
  private movieService = inject(MovieService);
  private seo = inject(SeoService);
  private destroy$ = new Subject<void>();
  movies = signal<Movie[]>([]);
  currentIndex = signal(0);
  private intervalId: any;
  isLoading = signal(true);
  hasError = signal(false);

  ngOnInit() {
    this.seo.setDefaultTags();
    
    this.movieService.getTrendingMovies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.movies.set(response.results);
          this.isLoading.set(false);
          this.startAutoPlay();
        },
        error: () => {
          this.isLoading.set(false);
          this.hasError.set(true);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.intervalId = setInterval(() => {
      this.nextMovie();
    }, 5000);
  }

  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextMovie() {
    if (this.movies().length === 0) return;
    this.currentIndex.update(val => (val + 1) % this.movies().length);
    this.startAutoPlay();
  }

  prevMovie() {
    if (this.movies().length === 0) return;
    this.currentIndex.update(val => 
      val === 0 ? this.movies().length - 1 : val - 1
    );
    this.startAutoPlay();
  }
}

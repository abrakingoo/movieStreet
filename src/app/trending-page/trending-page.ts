import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MovieService } from '../services/movie';
import { Movie, TVShow } from '../models/tmdb.types';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { BookmarkService } from '../services/bookmark';

type MediaItem = (Movie | TVShow) & { title: string; release_date: string; media_type: string };

@Component({
  selector: 'app-trending-page',
  imports: [CommonModule, RouterLink, NgTemplateOutlet],
  templateUrl: './trending-page.html',
  styleUrl: './trending-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendingPage implements OnInit {
  private movieService = inject(MovieService);
  private router = inject(Router);
  bookmarkService = inject(BookmarkService);
  
  movies = signal<MediaItem[]>([]);
  series = signal<MediaItem[]>([]);
  anime = signal<MediaItem[]>([]);
  kdrama = signal<MediaItem[]>([]);
  animation = signal<MediaItem[]>([]);
  
  isLoading = signal(true);

  ngOnInit() {
    this.loadTrendingContent();
  }

  loadTrendingContent() {
    this.movieService.getTrendingMovies().subscribe(res => 
      this.movies.set(res.results.slice(0, 10).map(m => ({...m, media_type: 'movie'})))
    );

    this.movieService.getTrendingTV().subscribe(res => 
      this.series.set(res.results.slice(0, 10).map(tv => ({
        ...tv, 
        title: tv.name, 
        release_date: tv.first_air_date, 
        media_type: 'tv'
      })))
    );

    this.movieService.discoverTV({ with_genres: 16, with_origin_country: 'JP' }).subscribe(res => {
      this.anime.set(res.results.slice(0, 10).map(tv => ({
        ...tv, 
        title: tv.name, 
        release_date: tv.first_air_date, 
        media_type: 'tv'
      })));
      this.isLoading.set(false);
    });

    this.movieService.discoverTV({ with_origin_country: 'KR' }).subscribe(res => 
      this.kdrama.set(res.results.slice(0, 10).map(tv => ({
        ...tv, 
        title: tv.name, 
        release_date: tv.first_air_date, 
        media_type: 'tv'
      })))
    );

    this.movieService.discoverMovies({ with_genres: 16 }).subscribe(res => 
      this.animation.set(res.results.slice(0, 10).map(m => ({...m, media_type: 'movie'})))
    );
  }

  viewDetails(item: MediaItem) {
    const type = item.media_type || 'movie';
    this.router.navigate(['/details', type, item.id]).then(() => {
      window.scrollTo(0, 0);
    });
  }

  toggleBookmark(item: MediaItem, event: Event) {
    event.stopPropagation();
    this.bookmarkService.toggleBookmark(item as Movie);
  }
}

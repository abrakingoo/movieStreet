import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movie';
import { Movie } from '../models/tmdb.types';
import { BookmarkService } from '../services/bookmark';

@Component({
  selector: 'app-genre',
  imports: [],
  templateUrl: './genre.html',
  styleUrl: './genre.css',
})
export class Genre implements OnInit {
  private movieService = inject(MovieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  bookmarkService = inject(BookmarkService);
  
  results = signal<Movie[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  currentPage = signal(1);
  totalPages = signal(0);
  genreName = '';
  genreId = 0;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.genreId = parseInt(params['id']) || 0;
      this.genreName = params['name'] || 'Genre';
      const page = parseInt(params['page']) || 1;
      this.loadGenre(this.genreId, page);
    });
  }

  loadGenre(genreId: number, page: number) {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.currentPage.set(page);

    this.movieService.discoverMovies({ with_genres: genreId, page }).subscribe({
      next: res => {
        const items = res.results.filter(item => item.poster_path);
        this.results.set(items);
        this.totalPages.set(res.total_pages || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
      }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.router.navigate(['/genres'], {
        queryParams: { id: this.genreId, name: this.genreName, page }
      });
    }
  }

  viewDetails(item: Movie) {
    this.router.navigate(['/details', 'movie', item.id]).then(() => {
      window.scrollTo(0, 0);
    });
  }

  toggleBookmark(item: Movie, event: Event) {
    event.stopPropagation();
    this.bookmarkService.toggleBookmark({ ...item, media_type: 'movie' });
  }
}

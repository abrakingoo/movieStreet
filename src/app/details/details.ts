import { Component, OnInit, inject, signal, computed, effect, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movie';
import { Movie, TVShow, MovieDetails, TVShowDetails } from '../models/tmdb.types';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BookmarkService } from '../services/bookmark';
import { SeoService } from '../core/services/seo.service';
import { ShareService } from '../services/share.service';
import { UserRatingService } from '../services/user-rating.service';
import { TVTrackingService } from '../services/tv-tracking.service';
import { SlicePipe, isPlatformBrowser } from '@angular/common';

type MediaItem = (Movie | TVShow) & { title: string; release_date: string; media_type: string };
type MediaDetails = (MovieDetails | TVShowDetails) & { title: string; release_date: string };

@Component({
  selector: 'app-details',
  imports: [SlicePipe],
  templateUrl: './details.html',
  styleUrl: './details.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Details implements OnInit {
  private movieService = inject(MovieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);
  private shareService = inject(ShareService);
  private ratingService = inject(UserRatingService);
  private tvTracking = inject(TVTrackingService);
  bookmarkService = inject(BookmarkService);
  
  details = signal<MediaDetails | null>(null);
  recommendations = signal<MediaItem[]>([]);
  trailerUrl = signal<SafeResourceUrl | null>(null);
  rawTrailerUrl = signal<string | null>(null);
  showTrailer = signal(false);
  isLoading = signal(true);
  hasError = signal(false);
  watchProviders = signal<any>(null);
  cast = signal<any[]>([]);
  reviews = signal<any[]>([]);
  similar = signal<MediaItem[]>([]);
  showAllReviews = signal(false);
  showShareMenu = signal(false);
  showRatingModal = signal(false);
  userRating = signal(0);
  userReviewText = signal('');
  selectedSeason = signal(1);
  seasonDetails = signal<any>(null);
  showEpisodes = signal(false);
  isBookmarked = computed(() => this.details() ? this.bookmarkService.isBookmarked(this.details()!.id) : false);
  userReview = computed(() => this.details() ? this.ratingService.getMovieReview(this.details()!.id) : undefined);
  isTVShow = computed(() => this.route.snapshot.params['type'] === 'tv');
  isMovie = computed(() => this.route.snapshot.params['type'] === 'movie');
  seasonNumbers = computed(() => {
    const show = this.details() as any;
    if (show && 'number_of_seasons' in show) {
      return Array.from({length: show.number_of_seasons}, (_, i) => i + 1);
    }
    return [];
  });
  
  Array = Array;

  constructor() {
    effect(() => {
      const details = this.details();
      if (details) {
        this.seo.updateMetaTags({
          title: details.title,
          description: details.overview || 'View details, cast, reviews and more',
          image: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : undefined,
          type: 'video.movie'
        });
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const type = params['type'] as 'movie' | 'tv';
      const id = parseInt(params['id']);
      this.loadDetails(type, id);
      this.loadRecommendations(type, id);
      this.loadTrailer(type, id);
      this.loadWatchProviders(type, id);
      this.loadCast(type, id);
      this.loadReviews(type, id);
      this.loadSimilar(type, id);
      
      if (type === 'tv') {
        this.loadSeasonDetails(id, this.selectedSeason());
      }
    });
  }

  loadDetails(type: 'movie' | 'tv', id: number) {
    this.isLoading.set(true);
    this.hasError.set(false);

    if (type === 'movie') {
      this.movieService.getMovieDetails(id).subscribe({
        next: res => {
          if (res) {
            this.details.set({
              ...res,
              title: res.title,
              release_date: res.release_date
            } as MediaDetails);
          } else {
            this.hasError.set(true);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.hasError.set(true);
        }
      });
    } else {
      this.movieService.getTVDetails(id).subscribe({
        next: res => {
          if (res) {
            this.details.set({
              ...res,
              title: res.name,
              release_date: res.first_air_date
            } as MediaDetails);
          } else {
            this.hasError.set(true);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.hasError.set(true);
        }
      });
    }
  }

  loadRecommendations(type: 'movie' | 'tv', id: number) {
    this.movieService.getRecommendations(type, id).subscribe({
      next: res => {
        const items = res.results.slice(0, 20).map(item => {
          const isTV = 'name' in item;
          return {
            ...item,
            title: isTV ? item.name : item.title,
            release_date: isTV ? item.first_air_date : item.release_date,
            media_type: type
          } as MediaItem;
        }).filter(item => item.poster_path);
        this.recommendations.set(items);
      }
    });
  }

  loadTrailer(type: 'movie' | 'tv', id: number) {
    this.movieService.getVideos(type, id).subscribe({
      next: res => {
        const trailer = res.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        if (trailer) {
          this.rawTrailerUrl.set(`https://www.youtube.com/watch?v=${trailer.key}`);
          
          let origin = '';
          if (isPlatformBrowser(this.platformId)) {
            origin = window.location.origin;
          }
          
          const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1&origin=${encodeURIComponent(origin)}`
          );
          this.trailerUrl.set(safeUrl);
        } else {
            this.trailerUrl.set(null);
            this.rawTrailerUrl.set(null);
        }
      }
    });
  }

  loadWatchProviders(type: 'movie' | 'tv', id: number) {
    this.movieService.getWatchProviders(type, id).subscribe({
      next: res => {
        // US is the default region, you can change to other countries
        const usProviders = res.results?.US;
        if (usProviders) {
          this.watchProviders.set(usProviders);
        }
      }
    });
  }

  loadCast(type: 'movie' | 'tv', id: number) {
    this.movieService.getCredits(type, id).subscribe({
      next: res => {
        this.cast.set(res.cast.slice(0, 10));
      }
    });
  }

  loadReviews(type: 'movie' | 'tv', id: number) {
    this.movieService.getReviews(type, id).subscribe({
      next: res => {
        this.reviews.set(res.results.slice(0, 5));
      }
    });
  }

  loadSimilar(type: 'movie' | 'tv', id: number) {
    this.movieService.getSimilar(type, id).subscribe({
      next: res => {
        const items = res.results.slice(0, 10).map(item => {
          const isTV = 'name' in item;
          return {
            ...item,
            title: isTV ? item.name : item.title,
            release_date: isTV ? item.first_air_date : item.release_date,
            media_type: type
          } as MediaItem;
        }).filter(item => item.poster_path);
        this.similar.set(items);
      }
    });
  }

  toggleTrailer() {
    this.showTrailer.set(!this.showTrailer());
  }

  viewDetails(item: MediaItem) {
    this.router.navigate(['/details', item.media_type, item.id]);
    window.scrollTo(0, 0);
  }

  goBack() {
    window.history.back();
  }

  toggleBookmark() {
    const item = this.details();
    if (item) {
      const mediaType = this.route.snapshot.params['type'];
      this.bookmarkService.toggleBookmark({
        id: item.id,
        title: item.title,
        backdrop_path: item.backdrop_path || '',
        poster_path: item.poster_path || '',
        overview: item.overview || '',
        vote_average: item.vote_average,
        vote_count: item.vote_count,
        popularity: item.popularity,
        adult: item.adult,
        original_language: item.original_language,
        genre_ids: item.genres.map(g => g.id),
        media_type: mediaType,
        ...(mediaType === 'movie' ? {
          original_title: (item as MovieDetails).original_title,
          release_date: item.release_date,
          video: (item as MovieDetails).video
        } : {
          name: (item as TVShowDetails).name,
          original_name: (item as TVShowDetails).original_name,
          first_air_date: item.release_date
        })
      } as Movie);
    }
  }

  toggleShareMenu() {
    this.showShareMenu.update(v => !v);
  }

  shareMovie() {
    const movie = this.details();
    if (movie) {
      this.shareService.shareMovie({
        id: movie.id,
        title: movie.title,
        overview: movie.overview || undefined
      });
      this.showShareMenu.set(false);
    }
  }

  shareOnTwitter() {
    const movie = this.details();
    if (movie) {
      this.shareService.shareOnTwitter({
        id: movie.id,
        title: movie.title
      });
      this.showShareMenu.set(false);
    }
  }

  shareOnFacebook() {
    const movie = this.details();
    if (movie) {
      this.shareService.shareOnFacebook({
        id: movie.id,
        title: movie.title
      });
      this.showShareMenu.set(false);
    }
  }

  shareOnWhatsApp() {
    const movie = this.details();
    if (movie) {
      this.shareService.shareOnWhatsApp({
        id: movie.id,
        title: movie.title
      });
      this.showShareMenu.set(false);
    }
  }

  openRatingModal() {
    const existing = this.userReview();
    if (existing) {
      this.userRating.set(existing.rating);
      this.userReviewText.set(existing.review);
    } else {
      this.userRating.set(0);
      this.userReviewText.set('');
    }
    this.showRatingModal.set(true);
  }

  closeRatingModal() {
    this.showRatingModal.set(false);
  }

  setRating(rating: number) {
    this.userRating.set(rating);
  }

  submitReview() {
    const movie = this.details();
    if (movie && this.userRating() > 0) {
      const existing = this.userReview();
      if (existing) {
        this.ratingService.updateReview(movie.id, this.userRating(), this.userReviewText());
      } else {
        this.ratingService.addReview({
          movieId: movie.id,
          movieTitle: movie.title,
          rating: this.userRating(),
          review: this.userReviewText(),
          userName: 'You'
        });
      }
      this.closeRatingModal();
    }
  }

  deleteUserReview() {
    const movie = this.details();
    if (movie) {
      this.ratingService.deleteReview(movie.id);
      this.closeRatingModal();
    }
  }

  loadSeasonDetails(tvId: number, season: number) {
    this.movieService.getTVSeasonDetails(tvId, season).subscribe({
      next: res => {
        this.seasonDetails.set(res);
      }
    });
  }

  changeSeason(season: number) {
    this.selectedSeason.set(season);
    const tvId = this.details()?.id;
    if (tvId) {
      this.loadSeasonDetails(tvId, season);
    }
  }

  toggleEpisodes() {
    this.showEpisodes.update(v => !v);
  }

  toggleEpisodeWatched(episode: any) {
    const show = this.details();
    if (!show) return;
    
    const isWatched = this.tvTracking.isEpisodeWatched(show.id, this.selectedSeason(), episode.episode_number);
    
    if (isWatched) {
      this.tvTracking.markEpisodeUnwatched(show.id, this.selectedSeason(), episode.episode_number);
    } else {
      this.tvTracking.markEpisodeWatched(show.id, show.title, this.selectedSeason(), episode.episode_number);
    }
  }

  isEpisodeWatched(episodeNumber: number): boolean {
    const show = this.details();
    if (!show) return false;
    return this.tvTracking.isEpisodeWatched(show.id, this.selectedSeason(), episodeNumber);
  }

  getSeasonProgress(season: number): number {
    const show = this.details();
    const seasonData = this.seasonDetails();
    if (!show || !seasonData) return 0;
    return this.tvTracking.getSeasonProgress(show.id, season, seasonData.episodes?.length || 0);
  }

  getProductionCountries(): string {
    const details = this.details() as any;
    if (details?.production_countries) {
      return details.production_countries.map((c: any) => c.name).join(', ');
    }
    return '';
  }
}

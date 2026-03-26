import { Injectable, inject } from '@angular/core';
import { MovieService } from './movie';
import { BookmarkService } from './bookmark';
import { UserRatingService } from './user-rating.service';
import { Observable, forkJoin, map, of, switchMap, catchError } from 'rxjs';
import { Movie, TVShow } from '../models/tmdb.types';

export type Mood = 'action' | 'adventurous' | 'relaxed' | 'thrilled' | 'romantic' | 'thoughtful' | 'happy';

interface MoodProfile {
  name: string;
  emoji: string;
  description: string;
  genres: number[];
  minRating: number;
  keywords: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MoodRecommendationService {
  private movieService = inject(MovieService);
  private bookmarkService = inject(BookmarkService);
  private ratingService = inject(UserRatingService);

  private moodProfiles: Record<Mood, MoodProfile> = {
    action: {
      name: 'Action',
      emoji: '💥',
      description: 'High-octane thrills and explosive entertainment',
      genres: [28], // Action only
      minRating: 6.5,
      keywords: ['action', 'fight', 'explosive']
    },
    adventurous: {
      name: 'Adventurous',
      emoji: '🗺️',
      description: 'Epic journeys and thrilling quests',
      genres: [12, 14], // Adventure, Fantasy
      minRating: 7.0,
      keywords: ['adventure', 'journey', 'quest', 'exploration']
    },
    relaxed: {
      name: 'Relaxed',
      emoji: '☕',
      description: 'Light-hearted and feel-good',
      genres: [35, 10751, 10749], // Comedy, Family, Romance
      minRating: 6.5,
      keywords: ['comedy', 'feel-good', 'light', 'fun']
    },
    thrilled: {
      name: 'Thrilled',
      emoji: '⚡',
      description: 'Edge-of-your-seat excitement',
      genres: [53, 27, 80], // Thriller, Horror, Crime
      minRating: 7.0,
      keywords: ['suspense', 'thriller', 'mystery', 'intense']
    },
    romantic: {
      name: 'Romantic',
      emoji: '💕',
      description: 'Love stories and heartwarming tales',
      genres: [10749, 18], // Romance, Drama
      minRating: 7.0,
      keywords: ['love', 'romance', 'relationship', 'heartwarming']
    },
    thoughtful: {
      name: 'Thoughtful',
      emoji: '🧠',
      description: 'Mind-bending and thought-provoking',
      genres: [878, 18, 99], // Sci-Fi, Drama, Documentary
      minRating: 7.5,
      keywords: ['philosophical', 'deep', 'thought-provoking', 'intelligent']
    },
    happy: {
      name: 'Happy',
      emoji: '😊',
      description: 'Uplifting and joyful entertainment',
      genres: [16, 35, 10402], // Animation, Comedy, Music
      minRating: 7.0,
      keywords: ['uplifting', 'joyful', 'happy', 'cheerful']
    }
  };

  getMoodProfiles(): MoodProfile[] {
    return Object.values(this.moodProfiles);
  }

  getRecommendationsByGenre(genreId: number, genreName: string, page: number = 1): Observable<(Movie | TVShow)[]> {
    return forkJoin([
      this.movieService.discoverMovies({ 
        with_genres: genreId, 
        sort_by: 'popularity.desc',
        page: page,
        'primary_release_date.gte': '2020-01-01'
      }),
      this.movieService.discoverTV({ 
        with_genres: genreId, 
        sort_by: 'popularity.desc',
        page: page 
      })
    ]).pipe(
      map(([movies, tvShows]) => {
        const combined = [
          ...movies.results.map(m => ({ ...m, media_type: 'movie' as const })),
          ...tvShows.results.map(t => ({ ...t, media_type: 'tv' as const }))
        ];

        return combined
          .filter(item => item.poster_path)
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 20);
      })
    );
  }

  getRecommendationsByMood(mood: Mood): Observable<(Movie | TVShow)[]> {
    const profile = this.moodProfiles[mood];
    const genreId = profile.genres[Math.floor(Math.random() * profile.genres.length)];

    return forkJoin([
      this.movieService.discoverMovies({ 
        with_genres: genreId, 
        sort_by: 'popularity.desc',
        page: 1,
        'primary_release_date.gte': '2020-01-01'
      }),
      this.movieService.discoverTV({ 
        with_genres: genreId, 
        sort_by: 'popularity.desc',
        page: 1 
      })
    ]).pipe(
      map(([movies, tvShows]) => {
        const combined = [
          ...movies.results.map(m => ({ ...m, media_type: 'movie' as const })),
          ...tvShows.results.map(t => ({ ...t, media_type: 'tv' as const }))
        ];

        return combined
          .filter(item => item.vote_average >= profile.minRating && item.poster_path)
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 20);
      })
    );
  }

  getPersonalizedMood(): Mood {
    const bookmarks = this.bookmarkService.bookmarks();
    const reviews = this.ratingService.getAllReviews();

    if (bookmarks.length === 0 && reviews.length === 0) {
      return this.getRandomMood();
    }

    const genreCounts = new Map<number, number>();
    
    bookmarks.forEach((item: Movie) => {
      item.genre_ids?.forEach((genreId: number) => {
        genreCounts.set(genreId, (genreCounts.get(genreId) || 0) + 1);
      });
    });

    const topGenre = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    if (!topGenre) return this.getRandomMood();

    for (const [mood, profile] of Object.entries(this.moodProfiles)) {
      if (profile.genres.includes(topGenre)) {
        return mood as Mood;
      }
    }

    return this.getRandomMood();
  }

  private getRandomMood(): Mood {
    const moods: Mood[] = ['action', 'adventurous', 'relaxed', 'thrilled', 'romantic', 'thoughtful', 'happy'];
    return moods[Math.floor(Math.random() * moods.length)];
  }

  searchMovieAndGetSimilar(title: string): Observable<{movie: any, recommendations: (Movie | TVShow)[]}> {
    return forkJoin([
      this.movieService.searchMovies(title, 1),
      this.movieService.searchTV(title, 1)
    ]).pipe(
      switchMap(([movieResults, tvResults]): Observable<{movie: any, recommendations: (Movie | TVShow)[]}> => {
        const movie = movieResults.results[0];
        const tv = tvResults.results[0];
        
        if (!movie && !tv) {
          return of({ movie: null, recommendations: [] });
        }
        
        const useMovie = movie && (!tv || movie.popularity >= tv.popularity);
        const item = useMovie ? movie : tv;
        const type = useMovie ? 'movie' : 'tv';
        
        return forkJoin([
          useMovie ? this.movieService.getMovieDetails(item.id) : this.movieService.getTVDetails(item.id),
          this.movieService.getSimilar(type, item.id)
        ]).pipe(
          map(([details, similar]): {movie: any, recommendations: (Movie | TVShow)[]} => ({
            movie: details,
            recommendations: (similar?.results || []).slice(0, 20).map((m: any) => ({ ...m, media_type: type }))
          }))
        );
      })
    );
  }

  searchMovie(title: string): Observable<{movie: any, allResults: any[]}> {
    return forkJoin([
      this.movieService.searchMovies(title, 1),
      this.movieService.searchTV(title, 1)
    ]).pipe(
      switchMap(([movieResults, tvResults]): Observable<{movie: any, allResults: any[]}> => {
        const movies = movieResults.results || [];
        const tvs = tvResults.results || [];
        
        if (movies.length === 0 && tvs.length === 0) {
          return of({ movie: null, allResults: [] });
        }
        
        const allResults = [
          ...movies.map((m: any) => ({ ...m, media_type: 'movie' })),
          ...tvs.map((t: any) => ({ ...t, media_type: 'tv' }))
        ].sort((a, b) => b.popularity - a.popularity);
        
        const topItem = allResults[0];
        const type = topItem.media_type;
        
        if (type === 'movie') {
          return this.movieService.getMovieDetails(topItem.id).pipe(
            map((details: any): {movie: any, allResults: any[]} => ({ 
              movie: details ? { ...details, media_type: type } : null,
              allResults 
            }))
          );
        } else {
          return this.movieService.getTVDetails(topItem.id).pipe(
            map((details: any): {movie: any, allResults: any[]} => ({ 
              movie: details ? { ...details, media_type: type } : null,
              allResults 
            }))
          );
        }
      }),
      catchError(() => of({ movie: null, allResults: [] }))
    );
  }
}

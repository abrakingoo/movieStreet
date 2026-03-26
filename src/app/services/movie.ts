import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, catchError, of } from 'rxjs';
import { Movie, TVShow, MovieDetails, TVShowDetails, Video, ApiResponse } from '../models/tmdb.types';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  private BASE_URL = 'https://api.themoviedb.org/3';
  private cache = new Map<string, Observable<any>>();

  getTrendingMovies(): Observable<ApiResponse<Movie>> {
    return this.getCached('trending/movie/week', 
      this.http.get<ApiResponse<Movie>>(`${this.BASE_URL}/trending/movie/week`)
    );
  }

  getTrendingTV(): Observable<ApiResponse<TVShow>> {
    return this.getCached('trending/tv/week',
      this.http.get<ApiResponse<TVShow>>(`${this.BASE_URL}/trending/tv/week`)
    );
  }

  getMovieDetails(id: number): Observable<MovieDetails | null> {
    return this.http.get<MovieDetails>(`${this.BASE_URL}/movie/${id}`)
      .pipe(catchError(() => of(null)));
  }

  getTVDetails(id: number): Observable<TVShowDetails | null> {
    return this.http.get<TVShowDetails>(`${this.BASE_URL}/tv/${id}`)
      .pipe(catchError(() => of(null)));
  }

  getRecommendations(type: 'movie' | 'tv', id: number): Observable<ApiResponse<Movie | TVShow>> {
    return this.http.get<ApiResponse<Movie | TVShow>>(`${this.BASE_URL}/${type}/${id}/recommendations`)
      .pipe(catchError(() => of({ results: [] })));
  }

  getVideos(type: 'movie' | 'tv', id: number): Observable<ApiResponse<Video>> {
    return this.http.get<ApiResponse<Video>>(`${this.BASE_URL}/${type}/${id}/videos`)
      .pipe(catchError(() => of({ results: [] })));
  }

  getWatchProviders(type: 'movie' | 'tv', id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/${type}/${id}/watch/providers`)
      .pipe(catchError(() => of({ results: {} })));
  }

  getCredits(type: 'movie' | 'tv', id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/${type}/${id}/credits`)
      .pipe(catchError(() => of({ cast: [], crew: [] })));
  }

  getReviews(type: 'movie' | 'tv', id: number, page: number = 1): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/${type}/${id}/reviews?page=${page}`)
      .pipe(catchError(() => of({ results: [], total_pages: 0 })));
  }

  getSimilar(type: 'movie' | 'tv', id: number): Observable<ApiResponse<Movie | TVShow>> {
    return this.http.get<ApiResponse<Movie | TVShow>>(`${this.BASE_URL}/${type}/${id}/similar`)
      .pipe(catchError(() => of({ results: [] })));
  }

  searchMovies(query: string, page: number = 1): Observable<ApiResponse<Movie>> {
    return this.http.get<ApiResponse<Movie>>(
      `${this.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
    ).pipe(catchError(() => of({ results: [], page: 1, total_pages: 0 })));
  }

  searchTV(query: string, page: number = 1): Observable<ApiResponse<TVShow>> {
    return this.http.get<ApiResponse<TVShow>>(
      `${this.BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=${page}`
    ).pipe(catchError(() => of({ results: [], page: 1, total_pages: 0 })));
  }

  discoverMovies(params: { 
    with_genres?: number; 
    page?: number; 
    sort_by?: string; 
    'primary_release_date.gte'?: string; 
    'primary_release_date.lte'?: string; 
  }): Observable<ApiResponse<Movie>> {
    const queryParams = new URLSearchParams();
    if (params.with_genres) queryParams.set('with_genres', params.with_genres.toString());
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.sort_by) queryParams.set('sort_by', params.sort_by);
    if (params['primary_release_date.gte']) queryParams.set('primary_release_date.gte', params['primary_release_date.gte']);
    if (params['primary_release_date.lte']) queryParams.set('primary_release_date.lte', params['primary_release_date.lte']);
    
    return this.http.get<ApiResponse<Movie>>(`${this.BASE_URL}/discover/movie?${queryParams}`)
      .pipe(catchError(() => of({ results: [], page: 1, total_pages: 0 })));
  }

  discoverTV(params: { with_genres?: number; with_origin_country?: string; page?: number; sort_by?: string }): Observable<ApiResponse<TVShow>> {
    const queryParams = new URLSearchParams();
    if (params.with_genres) queryParams.set('with_genres', params.with_genres.toString());
    if (params.with_origin_country) queryParams.set('with_origin_country', params.with_origin_country);
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.sort_by) queryParams.set('sort_by', params.sort_by);
    
    return this.http.get<ApiResponse<TVShow>>(`${this.BASE_URL}/discover/tv?${queryParams}`)
      .pipe(catchError(() => of({ results: [], page: 1, total_pages: 0 })));
  }

  getCollection(id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/collection/${id}`)
      .pipe(catchError(() => of(null)));
  }

  getUpcomingMovies(page: number = 1): Observable<ApiResponse<Movie>> {
    return this.http.get<ApiResponse<Movie>>(`${this.BASE_URL}/movie/upcoming?page=${page}`)
      .pipe(catchError(() => of({ results: [], page: 1, total_pages: 0 })));
  }

  getTVSeasonDetails(tvId: number, seasonNumber: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/tv/${tvId}/season/${seasonNumber}`)
      .pipe(catchError(() => of(null)));
  }

  getTVEpisodeDetails(tvId: number, seasonNumber: number, episodeNumber: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`)
      .pipe(catchError(() => of(null)));
  }

  private getCached<T>(key: string, request: Observable<T>): Observable<T> {
    if (!this.cache.has(key)) {
      this.cache.set(key, request.pipe(shareReplay(1)));
    }
    return this.cache.get(key)!;
  }
}

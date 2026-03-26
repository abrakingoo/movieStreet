import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MovieService } from './movie';
import { Movie, ApiResponse } from '../models/tmdb.types';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('MovieService', () => {
  let service: MovieService;
  let httpMock: HttpTestingController;
  const BASE_URL = 'https://api.themoviedb.org/3';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MovieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch trending movies', () => {
    const mockResponse: ApiResponse<Movie> = {
      results: [{ id: 1, title: 'Test Movie' } as Movie],
      page: 1,
      total_pages: 1
    };

    service.getTrendingMovies().subscribe(response => {
      expect(response.results.length).toBe(1);
      expect(response.results[0].title).toBe('Test Movie');
    });

    const req = httpMock.expectOne(`${BASE_URL}/trending/movie/week`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should cache trending movies', () => {
    const mockResponse: ApiResponse<Movie> = {
      results: [{ id: 1, title: 'Test Movie' } as Movie]
    };

    service.getTrendingMovies().subscribe();
    service.getTrendingMovies().subscribe();

    const requests = httpMock.match(`${BASE_URL}/trending/movie/week`);
    expect(requests.length).toBe(1);
    requests[0].flush(mockResponse);
  });

  it('should handle movie details error', () => {
    service.getMovieDetails(999).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${BASE_URL}/movie/999`);
    req.error(new ProgressEvent('error'));
  });

  it('should search movies', () => {
    const mockResponse: ApiResponse<Movie> = {
      results: [{ id: 1, title: 'Search Result' } as Movie],
      page: 1,
      total_pages: 1
    };

    service.searchMovies('test').subscribe(response => {
      expect(response.results[0].title).toBe('Search Result');
    });

    const req = httpMock.expectOne(req => req.url.includes('/search/movie'));
    req.flush(mockResponse);
  });
});

import { TestBed } from '@angular/core/testing';
import { SearchService } from './search';
import { MovieService } from './movie';
import { of } from 'rxjs';
import { ApiResponse, Movie, TVShow } from '../models/tmdb.types';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('SearchService', () => {
  let service: SearchService;
  let movieServiceMock: any;

  beforeEach(() => {
    movieServiceMock = {
      searchMovies: vi.fn(),
      searchTV: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        SearchService,
        { provide: MovieService, useValue: movieServiceMock }
      ]
    });
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should clear search results for empty query', () => {
    service.handleSearch('');
    expect(service.searchResults().length).toBe(0);
    expect(service.isSearching()).toBe(false);
  });

  it('should perform search and combine results', async () => {
    const mockMovies: ApiResponse<Movie> = {
      results: [{ id: 1, title: 'Movie 1', popularity: 100, poster_path: '/test.jpg', release_date: '2024-01-01' } as Movie],
      page: 1,
      total_pages: 1
    };

    const mockTV: ApiResponse<TVShow> = {
      results: [{ id: 2, name: 'TV Show 1', first_air_date: '2024-01-01', popularity: 90, poster_path: '/test.jpg' } as TVShow],
      page: 1,
      total_pages: 1
    };

    movieServiceMock.searchMovies.mockReturnValue(of(mockMovies));
    movieServiceMock.searchTV.mockReturnValue(of(mockTV));

    service.handleSearch('test');

    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(service.searchResults().length).toBeGreaterThan(0);
    expect(service.isSearching()).toBe(false);
  });

  it('should clear search', () => {
    service.clearSearch();
    expect(service.searchResults().length).toBe(0);
    expect(service.totalPages()).toBe(0);
    expect(service.currentPage()).toBe(1);
  });
});

import { TestBed } from '@angular/core/testing';
import { BookmarkService } from './bookmark';
import { Movie } from '../models/tmdb.types';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('BookmarkService', () => {
  let service: BookmarkService;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => localStorageMock[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(BookmarkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add bookmark', () => {
    const movie: Movie = {
      id: 1,
      title: 'Test Movie',
      poster_path: '/test.jpg',
      backdrop_path: '/backdrop.jpg',
      overview: 'Test overview',
      vote_average: 8.5,
      vote_count: 100,
      popularity: 50,
      adult: false,
      original_language: 'en',
      original_title: 'Test Movie',
      release_date: '2024-01-01',
      genre_ids: [28],
      video: false
    };

    service.toggleBookmark(movie);
    expect(service.bookmarks().length).toBe(1);
    expect(service.isBookmarked(1)).toBe(true);
  });

  it('should remove bookmark', () => {
    const movie: Movie = {
      id: 1,
      title: 'Test Movie',
      poster_path: '/test.jpg',
      backdrop_path: '/backdrop.jpg',
      overview: 'Test overview',
      vote_average: 8.5,
      vote_count: 100,
      popularity: 50,
      adult: false,
      original_language: 'en',
      original_title: 'Test Movie',
      release_date: '2024-01-01',
      genre_ids: [28],
      video: false
    };

    service.toggleBookmark(movie);
    expect(service.isBookmarked(1)).toBe(true);
    
    service.toggleBookmark(movie);
    expect(service.isBookmarked(1)).toBe(false);
  });

  it('should check if movie is bookmarked', () => {
    expect(service.isBookmarked(999)).toBe(false);
  });
});

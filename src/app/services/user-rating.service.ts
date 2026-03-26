import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UserReview {
  movieId: number;
  movieTitle: string;
  rating: number;
  review: string;
  date: string;
  userName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserRatingService {
  private platformId = inject(PLATFORM_ID);
  private storageKey = 'moviestreet_reviews';
  
  reviews = signal<UserReview[]>(this.loadReviews());

  private loadReviews(): UserReview[] {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  }

  private saveReviews() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.reviews()));
    }
  }

  addReview(review: Omit<UserReview, 'date'>) {
    const newReview: UserReview = {
      ...review,
      date: new Date().toISOString()
    };
    this.reviews.update(reviews => [newReview, ...reviews]);
    this.saveReviews();
  }

  getMovieReview(movieId: number): UserReview | undefined {
    return this.reviews().find(r => r.movieId === movieId);
  }

  updateReview(movieId: number, rating: number, review: string) {
    this.reviews.update(reviews => 
      reviews.map(r => r.movieId === movieId 
        ? { ...r, rating, review, date: new Date().toISOString() }
        : r
      )
    );
    this.saveReviews();
  }

  deleteReview(movieId: number) {
    this.reviews.update(reviews => reviews.filter(r => r.movieId !== movieId));
    this.saveReviews();
  }

  getAllReviews(): UserReview[] {
    return this.reviews();
  }
}

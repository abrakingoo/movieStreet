import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MovieService } from '../services/movie';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface UpcomingMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  overview: string;
  vote_average: number;
}

@Component({
  selector: 'app-upcoming',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upcoming.html',
  styleUrl: './upcoming.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingComponent implements OnInit {
  private movieService = inject(MovieService);
  private router = inject(Router);

  upcomingMovies = signal<UpcomingMovie[]>([]);
  groupedByMonth = signal<{ month: string, movies: UpcomingMovie[] }[]>([]);
  selectedView = signal<'calendar' | 'list'>('calendar');
  isLoading = signal(true);

  ngOnInit() {
    this.loadUpcoming();
  }

  loadUpcoming() {
    this.isLoading.set(true);
    
    this.movieService.getUpcomingMovies(1).subscribe({
      next: res => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futureMovies = res.results.filter(movie => {
          const releaseDate = new Date(movie.release_date + 'T00:00:00');
          return releaseDate >= today;
        });
        
        this.upcomingMovies.set(futureMovies);
        this.groupByMonth(futureMovies);
        const isMobile = window.innerWidth <= 768;
        this.selectedView.set(isMobile ? 'list' : (futureMovies.length > 5 ? 'calendar' : 'list'));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  groupByMonth(movies: UpcomingMovie[]) {
    const groups: { month: string, movies: UpcomingMovie[] }[] = [];
    
    movies.forEach(movie => {
      const date = new Date(movie.release_date + 'T00:00:00'); // Ensure local date parsing
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      let group = groups.find(g => g.month === monthKey);
      if (!group) {
        group = { month: monthKey, movies: [] };
        groups.push(group);
      }
      group.movies.push(movie);
    });
    
    this.groupedByMonth.set(groups);
  }

  viewDetails(movie: UpcomingMovie) {
    this.router.navigate(['/details/movie', movie.id]);
  }

  toggleView() {
    this.selectedView.update(v => v === 'calendar' ? 'list' : 'calendar');
  }

  getDaysUntil(date: string): number {
    const release = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diff = release.getTime() - today.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
}

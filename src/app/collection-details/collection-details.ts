import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movie';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-collection-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collection-details.html',
  styleUrls: ['./collection-details.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionDetails {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(MovieService);
  
  private id$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    filter((id): id is string => id !== null),
    map(id => Number(id)),
    filter(id => !isNaN(id) && id > 0)
  );
  
  collection = toSignal(
    this.id$.pipe(
      switchMap(id => this.movieService.getCollection(id))
    ),
    { initialValue: null }
  );

  goBack() {
    this.router.navigate(['/collections']);
  }

  viewMovie(id: number) {
    this.router.navigate(['/details/movie', id]);
  }

  getImageUrl(path: string | null): string {
    if (!path) {
      return 'https://via.placeholder.com/500x750?text=No+Image';
    }
    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  getYear(date: string): string {
    return date ? new Date(date).getFullYear().toString() : '';
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { SearchService } from '../services/search';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private searchService = inject(SearchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  themeService = inject(ThemeService);
  searchQuery = '';
  showGenreDropdown = signal(false);
  showMobileMenu = signal(false);
  
  genres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 27, name: 'Horror' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Sci-Fi' },
    { id: 53, name: 'Thriller' }
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['query'] || '';
    });
  }

  handleSearch(query: string) {
    if (query.trim().length > 0) {
      this.router.navigate(['/search'], { queryParams: { query } });
    }
    this.searchService.handleSearch(query);
  }

  goHome() {
    this.router.navigate(['/']);
    this.searchService.clearSearch();
    this.searchQuery = '';
  }
  
  toggleGenreDropdown() {
    this.showGenreDropdown.set(!this.showGenreDropdown());
  }
  
  toggleMobileMenu() {
    this.showMobileMenu.set(!this.showMobileMenu());
  }
  
  selectGenre(genreId: number, genreName: string) {
    this.router.navigate(['/genres'], { queryParams: { id: genreId, name: genreName } });
    this.showGenreDropdown.set(false);
    this.showMobileMenu.set(false);
  }
}

import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./trending/trending').then(m => m.Trending)
  },
  { 
    path: 'search', 
    loadComponent: () => import('./search/search').then(m => m.Search)
  },
  { 
    path: 'trending', 
    loadComponent: () => import('./trending-page/trending-page').then(m => m.TrendingPage)
  },
  { 
    path: 'movies', 
    loadComponent: () => import('./category/category').then(m => m.Category)
  },
  { 
    path: 'series', 
    loadComponent: () => import('./category/category').then(m => m.Category)
  },
  { 
    path: 'animation', 
    loadComponent: () => import('./category/category').then(m => m.Category)
  },
  { 
    path: 'kdrama', 
    loadComponent: () => import('./category/category').then(m => m.Category)
  },
  { 
    path: 'anime', 
    loadComponent: () => import('./category/category').then(m => m.Category)
  },
  { 
    path: 'genres', 
    loadComponent: () => import('./genre/genre').then(m => m.Genre)
  },
  { 
    path: 'watchlist', 
    loadComponent: () => import('./watchlist/watchlist').then(m => m.Watchlist)
  },
  { 
    path: 'mood', 
    loadComponent: () => import('./mood-picker/mood-picker').then(m => m.MoodPicker)
  },
  { 
    path: 'upcoming', 
    loadComponent: () => import('./upcoming/upcoming').then(m => m.UpcomingComponent)
  },
  { 
    path: 'collections', 
    loadComponent: () => import('./collections/collections').then(m => m.Collections)
  },
  { 
    path: 'collection/:id', 
    loadComponent: () => import('./collection-details/collection-details').then(m => m.CollectionDetails)
  },
  { 
    path: 'details/:type/:id', 
    loadComponent: () => import('./details/details').then(m => m.Details)
  },
  { 
    path: '**', 
    loadComponent: () => import('./not-found/not-found').then(m => m.NotFound)
  }
];

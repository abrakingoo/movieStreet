import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Collection {
  id: number;
  name: string;
  poster: string;
}

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collections.html',
  styleUrls: ['./collections.css']
})
export class Collections {
  private router = inject(Router);
  
  allCollections: Collection[] = [
    { id: 131295, name: 'Marvel Cinematic Universe', poster: '/yFuKvT4Vm3sKHdFY4eG6I4ldAnn.jpg' },
    { id: 10, name: 'Star Wars Collection', poster: '/r8Ph5MYXL04Qzu4QBbq2KjqwtkQ.jpg' },
    { id: 645, name: 'James Bond Collection', poster: '/HORpg5CSkmeQlAolx3bKMrKgfi.jpg' },
    { id: 2344, name: 'The Matrix Collection', poster: '/bV9qTVHTVf0gkW0j7p7M0ILD4pG.jpg' },
    { id: 1570, name: 'Die Hard Collection', poster: '/xhnb5lVfwE7NHycdPNdIxHx7kZi.jpg' },
    { id: 86311, name: 'The Avengers Collection', poster: '/yFSIUVTCvgYrpalUktulvk3Gi5Y.jpg' },
    { id: 131296, name: 'X-Men Collection', poster: '/tEJyyLVKYquP7cFvXLwyIJJcZlZ.jpg' },
    { id: 9485, name: 'The Fast and the Furious', poster: '/uv63yAGg1zETAs1XQsOQpava87l.jpg' },
    { id: 535313, name: 'Godzilla Collection', poster: '/inNN466SKHNjbGmpfhfsaPQNleS.jpg' },
    { id: 8091, name: 'Alien Collection', poster: '/uQDxIlKQvyxdLc0qmIzBfpA7xer.jpg' },
    { id: 1709, name: 'Planet of the Apes', poster: '/qLBn3YCkNXJzfhgPFIB8Ym4fYJh.jpg' },
    { id: 2980, name: 'Ghostbusters Collection', poster: '/wV0IFsqRWkPDsLvHZs5iWkNGmYw.jpg' },
    { id: 8945, name: 'Mad Max Collection', poster: '/jlbCpd0OTUbLsM0ZlTwY5LKTlqR.jpg' },
    { id: 295, name: 'Pirates of the Caribbean', poster: '/bXJIHzNEYdGqC8cDzI7cFMqhaYZ.jpg' },
    { id: 1241, name: 'Harry Potter Collection', poster: '/c43BA0NNjFZZxlMdKaNEpqER8pS.jpg' },
    { id: 328, name: 'Jurassic Park Collection', poster: '/uVsKWZGj4CWhzHhyX7oBQxbGSST.jpg' },
    { id: 87359, name: 'Mission: Impossible', poster: '/geEjCGfdmRAA1skzgcxvjyS7Ko9.jpg' },
    { id: 556, name: 'Spider-Man Collection', poster: '/nogV4th2P5QWYvQIMiWHj4CFLU9.jpg' },
    { id: 263, name: 'The Dark Knight Collection', poster: '/bRm2DEgUiYciDw3myHuYFInD7la.jpg' },
    { id: 529892, name: 'Black Panther Collection', poster: '/xjm4JEJpvvc7C9pejf7EEgWBxeH.jpg' },
    { id: 422834, name: 'Deadpool Collection', poster: '/hBQOWY8qWXJVFAc8yLTh1teIu43.jpg' },
    { id: 404609, name: 'John Wick Collection', poster: '/xUidyvYFsbbuExifLkslpcd8SMc.jpg' },
    { id: 125574, name: 'The Hunger Games', poster: '/sItJZKp9Kv4Qh7rlKkHfYaJOsH0.jpg' },
    { id: 2806, name: 'The Terminator Collection', poster: '/rOzD37qVPHZXKP8FXjwHLKGnbFv.jpg' },
    { id: 8580, name: 'Predator Collection', poster: '/4vJPoLQD6M2cG8vGGiIJJUjGpio.jpg' },
    { id: 528, name: 'The Terminator Collection', poster: '/rOzD37qVPHZXKP8FXjwHLKGnbFv.jpg' },
    { id: 9743, name: 'Hannibal Lecter Collection', poster: '/7m8iNNDU2FDTL4NpJEYpWHvkHoI.jpg' },
    { id: 119050, name: 'Middle-earth Collection', poster: '/oENY593nKRVL2PnxXsMtlh8izb4.jpg' },
    { id: 131292, name: 'The Twilight Saga', poster: '/8mOLQGOvYGRmvPBnfJPPsKE5Vqz.jpg' },
    { id: 230, name: 'The Godfather Collection', poster: '/zqV8MGXfpLZiFVObLxpAI7wWonJ.jpg' }
  ];

  currentPage = 1;
  itemsPerPage = 20;

  get collections(): Collection[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.allCollections.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.allCollections.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  viewCollection(id: number) {
    this.router.navigate(['/collection', id]);
  }

  getImageUrl(path: string | null): string {
    if (!path) {
      return 'https://via.placeholder.com/500x750?text=No+Image';
    }
    return `https://image.tmdb.org/t/p/w500${path}`;
  }
}

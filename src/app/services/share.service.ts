import { Injectable, inject } from '@angular/core';
import { ToastService } from '../core/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private toast = inject(ToastService);

  shareMovie(movie: { id: number; title: string; overview?: string }) {
    const url = `${window.location.origin}/details/movie/${movie.id}`;
    const text = `Check out "${movie.title}" on MovieStreet!`;

    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: text,
        url: url
      }).catch(() => {});
    } else {
      this.copyToClipboard(url);
    }
  }

  shareOnTwitter(movie: { id: number; title: string }) {
    const url = `${window.location.origin}/details/movie/${movie.id}`;
    const text = `Check out "${movie.title}" on MovieStreet!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }

  shareOnFacebook(movie: { id: number; title: string }) {
    const url = `${window.location.origin}/details/movie/${movie.id}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  }

  shareOnWhatsApp(movie: { id: number; title: string }) {
    const url = `${window.location.origin}/details/movie/${movie.id}`;
    const text = `Check out "${movie.title}" on MovieStreet! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  private copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.toast.show('Link copied to clipboard!', 'success');
    });
  }
}

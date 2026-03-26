import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);

  updateMetaTags(config: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
  }) {
    if (config.title) {
      this.title.setTitle(`${config.title} | Movie Street`);
      this.meta.updateTag({ property: 'og:title', content: config.title });
      this.meta.updateTag({ name: 'twitter:title', content: config.title });
    }

    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
      this.meta.updateTag({ name: 'twitter:description', content: config.description });
    }

    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }

    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }

    if (config.type) {
      this.meta.updateTag({ property: 'og:type', content: config.type });
    }
  }

  setDefaultTags() {
    this.updateMetaTags({
      title: 'Discover Movies & TV Shows',
      description: 'Browse trending movies, TV shows, and collections. Your ultimate entertainment hub.',
      type: 'website'
    });
  }
}

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface LLMResponse {
  genre?: string;
  genreId?: number;
  mood?: string;
  searchTitle?: string;
  showSimilar?: boolean;
  response: string;
  options?: string[];
  loadMore?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LLMService {
  private platformId = inject(PLATFORM_ID);
  private conversationContext: string[] = [];
  private userProfile = {
    favoriteGenres: new Map<number, number>(),
    totalInteractions: 0,
    lastVisit: '',
    preferences: [] as string[]
  };

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserProfile();
    }
  }

  private loadUserProfile() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const saved = localStorage.getItem('movieChatProfile');
    if (saved) {
      const data = JSON.parse(saved);
      this.userProfile.favoriteGenres = new Map(data.favoriteGenres || []);
      this.userProfile.totalInteractions = data.totalInteractions || 0;
      this.userProfile.lastVisit = data.lastVisit || '';
      this.userProfile.preferences = data.preferences || [];
    }
  }

  private saveUserProfile() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const data = {
      favoriteGenres: Array.from(this.userProfile.favoriteGenres.entries()),
      totalInteractions: this.userProfile.totalInteractions,
      lastVisit: new Date().toISOString(),
      preferences: this.userProfile.preferences
    };
    localStorage.setItem('movieChatProfile', JSON.stringify(data));
  }

  private genreMap: Record<string, number> = {
    'action': 28,
    'adventure': 12,
    'animation': 16,
    'comedy': 35,
    'crime': 80,
    'documentary': 99,
    'drama': 18,
    'family': 10751,
    'fantasy': 14,
    'horror': 27,
    'romance': 10749,
    'sci-fi': 878,
    'science fiction': 878,
    'thriller': 53,
    'mystery': 9648,
    'war': 10752,
    'western': 37
  };

  private moods = ['action', 'adventurous', 'relaxed', 'thrilled', 'romantic', 'thoughtful', 'happy'];

  analyzeUserInput(userMessage: string, chatHistory: { role: 'user' | 'assistant', content: string }[] = []): Observable<LLMResponse> {
    const lowerMessage = userMessage.toLowerCase();
    this.conversationContext.push(lowerMessage);
    this.userProfile.totalInteractions++;
    this.saveUserProfile();

    return this.fallbackAnalysis(userMessage);
  }

  private fallbackAnalysis(userMessage: string): Observable<LLMResponse> {
    const lowerMessage = userMessage.toLowerCase();

    // Handle "more" or "load more" requests
    if (lowerMessage.match(/^(more|show more|load more|give me more)$/)) {
      return of({
        loadMore: true,
        response: ''
      });
    }

    // Handle "like [title]" pattern - show similar movies
    if (lowerMessage.match(/\b(like|similar to|such as)\b/)) {
      const titleMatch = lowerMessage.match(/(?:like|similar to|such as)\s+([\w\s]+)/i);
      if (titleMatch) {
        return of({
          searchTitle: titleMatch[1].trim(),
          showSimilar: true,
          response: ''
        });
      }
    }

    // Extract genre first (before greetings)
    for (const [genre, id] of Object.entries(this.genreMap)) {
      if (lowerMessage.includes(genre)) {
        return of({
          genre: genre.charAt(0).toUpperCase() + genre.slice(1),
          genreId: id,
          response: `Great choice! Let me find some ${genre} movies for you.`
        });
      }
    }

    // Extract mood
    const foundMood = this.moods.find(m => lowerMessage.includes(m));
    if (foundMood) {
      return of({
        mood: foundMood.charAt(0).toUpperCase() + foundMood.slice(1),
        response: `Perfect! I'll show you ${foundMood} picks.`
      });
    }

    // Handle greetings (after genre/mood check)
    if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/)) {
      return of({
        response: "Hello! I'm your entertainment expert. What kind of movies are you in the mood for today?",
        options: ['Action', 'Comedy', 'Horror', 'Romance', 'Sci-Fi', 'Drama']
      });
    }

    // Try as movie title if short (1-4 words) - show the actual movie
    const words = lowerMessage.trim().split(/\s+/);
    if (words.length <= 4) {
      return of({
        searchTitle: lowerMessage.trim(),
        showSimilar: false,
        response: ''
      });
    }

    return of({
      response: "I'm your movie expert! Try asking for a genre, mood, or a specific movie title.",
      options: ['Action', 'Comedy', 'Horror', 'Romance', 'Sci-Fi', 'Drama']
    });
  }
}

import { Component, inject, signal, computed, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { MoodRecommendationService, Mood } from '../services/mood-recommendation.service';
import { LLMService } from '../services/llm.service';
import { Movie, TVShow } from '../models/tmdb.types';

interface ChatMessage {
  text: string;
  isBot: boolean;
  options?: string[];
}

@Component({
  selector: 'app-mood-picker',
  imports: [],
  templateUrl: './mood-picker.html',
  styleUrl: './mood-picker.css'
})
export class MoodPicker implements AfterViewChecked {
  private moodService = inject(MoodRecommendationService);
  private llmService = inject(LLMService);
  private router = inject(Router);

  @ViewChild('chatMessages') private chatMessagesContainer?: ElementRef;
  private shouldScroll = false;

  messages = signal<ChatMessage[]>([
    { 
      text: "Hi! I'm your movie expert. What are you in the mood for?", 
      isBot: true
    }
  ]);
  
  recommendations = signal<(Movie | TVShow)[]>([]);
  isLoading = signal(false);
  isLoadingMore = signal(false);
  showRecommendations = signal(false);
  userInput = signal('');
  currentPage = signal(1);
  currentGenre = signal<{id: number, name: string} | null>(null);

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    if (this.chatMessagesContainer) {
      const element = this.chatMessagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  selectOption(option: string) {
    this.messages.update(msgs => [...msgs, { text: option, isBot: false }]);
    this.shouldScroll = true;
    
    this.isLoading.set(true);
    this.messages.update(msgs => [...msgs, { text: 'Let me find perfect picks for you...', isBot: true }]);
    this.shouldScroll = true;

    // Map button options to genres or moods
    const genreMap: Record<string, number> = {
      'action': 28,
      'comedy': 35,
      'horror': 27,
      'romance': 10749,
      'sci-fi': 878,
      'drama': 18,
      'animation': 16,
      'thriller': 53,
      'family': 10751
    };

    const lowerOption = option.toLowerCase();
    const genreId = genreMap[lowerOption];

    if (genreId) {
      // It's a genre, fetch by genre
      this.fetchByGenre(genreId, option);
    } else {
      // It's a mood, use mood service
      const mood = lowerOption as Mood;
      console.log('Fetching mood:', mood);
      
      this.moodService.getRecommendationsByMood(mood).subscribe({
        next: results => {
          console.log('Results received:', results.length);
          this.recommendations.set(results);
          this.isLoading.set(false);
          this.showRecommendations.set(true);
          this.messages.update(msgs => {
            const filtered = msgs.filter(m => m.text !== 'Let me find perfect picks for you...');
            return [...filtered, { 
              text: `Here are ${results.length} ${option.toLowerCase()} picks for you! 🎬`, 
              isBot: true 
            }];
          });
          this.shouldScroll = true;
        },
        error: (err) => {
          console.error('Error fetching recommendations:', err);
          this.isLoading.set(false);
          this.messages.update(msgs => {
            const filtered = msgs.filter(m => m.text !== 'Let me find perfect picks for you...');
            return [...filtered, { 
              text: 'Sorry, something went wrong. Please try again.', 
              isBot: true,
              options: ['Action', 'Comedy', 'Horror', 'Romance', 'Sci-Fi', 'Drama']
            }];
          });
          this.shouldScroll = true;
        }
      });
    }
  }

  sendMessage() {
    const input = this.userInput().trim();
    if (!input) return;

    this.messages.update(msgs => [...msgs, { text: input, isBot: false }]);
    this.userInput.set('');
    this.isLoading.set(true);
    this.shouldScroll = true;

    // Get recent history (last 10 messages) to maintain context
    const history = this.messages()
      .slice(-10)
      .map(m => ({ 
        role: m.isBot ? 'assistant' as const : 'user' as const, 
        content: m.text 
      }));

    // Use LLM to analyze input with history
    this.llmService.analyzeUserInput(input, history).subscribe({
      next: result => {
        this.isLoading.set(false);
        
        if (result.searchTitle) {
          if (result.showSimilar) {
            this.searchAndRecommend(result.searchTitle);
          } else {
            this.searchAndShow(result.searchTitle);
          }
        } else if (result.loadMore) {
          const genre = this.currentGenre();
          if (genre) {
            this.fetchByGenre(genre.id, genre.name, true);
          } else {
            this.messages.update(msgs => [...msgs, { 
              text: "What would you like to see more of? Try asking for a genre like Action or Comedy.", 
              isBot: true,
              options: ['Action', 'Comedy', 'Horror', 'Drama']
            }]);
            this.shouldScroll = true;
          }
        } else if (result.genreId && result.genre) {
          this.fetchByGenre(result.genreId, result.genre, result.loadMore || false);
        } else if (result.mood) {
          this.selectOption(result.mood);
        } else {
          this.messages.update(msgs => [...msgs, { 
            text: result.response, 
            isBot: true
          }]);
          this.shouldScroll = true;
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.messages.update(msgs => [...msgs, { 
          text: "I can help you find movies! Try mentioning a genre or mood.", 
          isBot: true
        }]);
        this.shouldScroll = true;
      }
    });
  }

  fetchByGenre(genreId: number, genreName: string, append: boolean = false) {
    if (append) {
      this.isLoadingMore.set(true);
      this.currentPage.update(p => p + 1);
      this.messages.update(msgs => [...msgs, { text: `Loading more ${genreName} movies...`, isBot: true }]);
    } else {
      this.isLoading.set(true);
      this.currentPage.set(1);
      this.currentGenre.set({id: genreId, name: genreName});
      this.messages.update(msgs => [...msgs, { text: `Finding ${genreName} movies for you...`, isBot: true }]);
    }
    
    this.shouldScroll = true;

    this.moodService.getRecommendationsByGenre(genreId, genreName, this.currentPage()).subscribe({
      next: results => {
        if (append) {
          this.recommendations.update(current => [...current, ...results]);
        } else {
          this.recommendations.set(results);
        }
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
        this.showRecommendations.set(true);
        this.messages.update(msgs => {
          const filtered = msgs.filter(m => !m.text.includes('Finding') && !m.text.includes('Loading more'));
          const total = this.recommendations().length;
          return [...filtered, { 
            text: append ? `Added ${results.length} more! You now have ${total} ${genreName} picks! 🎬` : `Here are ${results.length} ${genreName} picks! 🎬`, 
            isBot: true 
          }];
        });
        this.shouldScroll = true;
      },
      error: () => {
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
        this.messages.update(msgs => [...msgs, { 
          text: 'Sorry, something went wrong. Please try again.', 
          isBot: true
        }]);
        this.shouldScroll = true;
      }
    });
  }

  viewDetails(item: Movie | TVShow) {
    const type = 'media_type' in item ? item.media_type : 'name' in item ? 'tv' : 'movie';
    this.router.navigate(['/details', type, item.id]);
  }

  reset() {
    this.messages.set([
      { 
        text: "Hi! I'm your movie expert. What are you in the mood for?", 
        isBot: true
      }
    ]);
    this.recommendations.set([]);
    this.showRecommendations.set(false);
  }

  getTitle(item: Movie | TVShow): string {
    return 'title' in item ? item.title : 'name' in item ? item.name : '';
  }

  searchAndRecommend(title: string) {
    this.moodService.searchMovieAndGetSimilar(title).subscribe({
      next: ({ movie, recommendations }) => {
        if (movie && recommendations.length > 0) {
          const genreNames = movie.genres.map((g: any) => g.name).join(', ');
          this.recommendations.set(recommendations);
          this.showRecommendations.set(true);
          this.messages.update(msgs => [...msgs, { 
            text: `Found it! "${movie.title || movie.name}" is a ${genreNames}. Here are ${recommendations.length} similar recommendations!`, 
            isBot: true 
          }]);
        } else {
          this.messages.update(msgs => [...msgs, { 
            text: `I couldn't find "${title}". Try describing what you're looking for instead - like action, fantasy, or comedy!`, 
            isBot: true,
            options: ['Action', 'Fantasy', 'Comedy', 'Horror', 'Sci-Fi']
          }]);
        }
        this.shouldScroll = true;
      },
      error: () => {
        this.messages.update(msgs => [...msgs, { 
          text: 'Sorry, I had trouble searching. Try a genre instead!', 
          isBot: true,
          options: ['Action', 'Comedy', 'Horror', 'Drama']
        }]);
        this.shouldScroll = true;
      }
    });
  }

  searchAndShow(title: string) {
    this.moodService.searchMovie(title).subscribe({
      next: ({ movie, allResults }) => {
        if (movie) {
          const year = movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || '';
          const type = movie.media_type === 'movie' ? 'Movie' : 'TV Series';
          
          let message = `"${movie.title || movie.name}" (${year}) - ${type}`;
          
          const otherType = allResults.find((r: any) => 
            r.media_type !== movie.media_type && 
            (r.title || r.name).toLowerCase().includes(title.toLowerCase())
          );
          
          if (otherType) {
            const otherYear = otherType.release_date?.split('-')[0] || otherType.first_air_date?.split('-')[0] || '';
            const otherTypeName = otherType.media_type === 'movie' ? 'Movie' : 'TV Series';
            message += ` and "${otherType.title || otherType.name}" (${otherYear}) - ${otherTypeName}`;
          }
          
          this.recommendations.set(allResults.slice(0, 20));
          this.showRecommendations.set(true);
          this.messages.update(msgs => [...msgs, { 
            text: message, 
            isBot: true 
          }]);
        } else {
          this.messages.update(msgs => [...msgs, { 
            text: `I couldn't find "${title}". Try another title or ask for a genre!`, 
            isBot: true,
            options: ['Action', 'Comedy', 'Horror', 'Sci-Fi']
          }]);
        }
        this.shouldScroll = true;
      },
      error: () => {
        this.messages.update(msgs => [...msgs, { 
          text: 'Sorry, I had trouble searching. Try again!', 
          isBot: true
        }]);
        this.shouldScroll = true;
      }
    });
  }
}

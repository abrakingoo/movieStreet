import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface EpisodeProgress {
  showId: number;
  showName: string;
  seasonNumber: number;
  episodeNumber: number;
  totalSeasons: number;
  totalEpisodes: number;
  lastWatched: string;
}

export interface ShowProgress {
  showId: number;
  showName: string;
  seasons: Map<number, Set<number>>; // season -> watched episodes
  lastWatched: string;
}

@Injectable({
  providedIn: 'root'
})
export class TVTrackingService {
  private platformId = inject(PLATFORM_ID);
  private storageKey = 'moviestreet_tv_progress';
  
  progress = signal<Map<number, ShowProgress>>(this.loadProgress());

  private loadProgress(): Map<number, ShowProgress> {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        const map = new Map<number, ShowProgress>();
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          const seasons = new Map<number, Set<number>>();
          Object.entries(value.seasons).forEach(([season, episodes]: [string, any]) => {
            seasons.set(Number(season), new Set(episodes));
          });
          map.set(Number(key), {
            ...value,
            seasons
          });
        });
        return map;
      }
    }
    return new Map();
  }

  private saveProgress() {
    if (isPlatformBrowser(this.platformId)) {
      const data: any = {};
      this.progress().forEach((value, key) => {
        const seasons: any = {};
        value.seasons.forEach((episodes, season) => {
          seasons[season] = Array.from(episodes);
        });
        data[key] = {
          ...value,
          seasons
        };
      });
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
  }

  markEpisodeWatched(showId: number, showName: string, season: number, episode: number) {
    this.progress.update(map => {
      const newMap = new Map(map);
      const show = newMap.get(showId);
      
      if (show) {
        const seasonEpisodes = show.seasons.get(season) || new Set();
        seasonEpisodes.add(episode);
        show.seasons.set(season, seasonEpisodes);
        show.lastWatched = new Date().toISOString();
      } else {
        const seasons = new Map<number, Set<number>>();
        seasons.set(season, new Set([episode]));
        newMap.set(showId, {
          showId,
          showName,
          seasons,
          lastWatched: new Date().toISOString()
        });
      }
      
      return newMap;
    });
    this.saveProgress();
  }

  markEpisodeUnwatched(showId: number, season: number, episode: number) {
    this.progress.update(map => {
      const newMap = new Map(map);
      const show = newMap.get(showId);
      
      if (show) {
        const seasonEpisodes = show.seasons.get(season);
        if (seasonEpisodes) {
          seasonEpisodes.delete(episode);
          if (seasonEpisodes.size === 0) {
            show.seasons.delete(season);
          }
        }
        if (show.seasons.size === 0) {
          newMap.delete(showId);
        }
      }
      
      return newMap;
    });
    this.saveProgress();
  }

  isEpisodeWatched(showId: number, season: number, episode: number): boolean {
    const show = this.progress().get(showId);
    return show?.seasons.get(season)?.has(episode) || false;
  }

  getSeasonProgress(showId: number, season: number, totalEpisodes: number): number {
    const show = this.progress().get(showId);
    const watched = show?.seasons.get(season)?.size || 0;
    return totalEpisodes > 0 ? (watched / totalEpisodes) * 100 : 0;
  }

  getShowProgress(showId: number): ShowProgress | undefined {
    return this.progress().get(showId);
  }

  getNextEpisode(showId: number, season: number, episode: number): { season: number; episode: number } | null {
    const show = this.progress().get(showId);
    if (!show) return { season: 1, episode: 1 };
    
    const seasonEpisodes = show.seasons.get(season);
    if (!seasonEpisodes || !seasonEpisodes.has(episode)) {
      return { season, episode };
    }
    
    return { season, episode: episode + 1 };
  }

  markSeasonWatched(showId: number, showName: string, season: number, totalEpisodes: number) {
    this.progress.update(map => {
      const newMap = new Map(map);
      const show = newMap.get(showId);
      const episodes = new Set(Array.from({ length: totalEpisodes }, (_, i) => i + 1));
      
      if (show) {
        show.seasons.set(season, episodes);
        show.lastWatched = new Date().toISOString();
      } else {
        const seasons = new Map<number, Set<number>>();
        seasons.set(season, episodes);
        newMap.set(showId, {
          showId,
          showName,
          seasons,
          lastWatched: new Date().toISOString()
        });
      }
      
      return newMap;
    });
    this.saveProgress();
  }
}

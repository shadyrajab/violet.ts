import { singleton } from 'tsyringe';
import { envs } from '../../../core/config';
import {
  SearchMovieResponse,
  MovieDetailsResponse,
  MovieProvidersResponse
} from '../interfaces/movie.interface';

@singleton()
export class TheMovieDBService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p';

  constructor() {
    this.apiKey = envs.THE_MOVIE_DB_API_KEY;
    this.baseUrl = envs.THE_MOVIE_DB_API_URL;
  }

  private mapKeysToCamelCase<T>(obj: unknown): T {
    if (Array.isArray(obj)) {
      return obj.map(item => this.mapKeysToCamelCase(item)) as T;
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = this.mapKeysToCamelCase(value);
        return acc;
      }, {} as Record<string, unknown>) as T;
    }
    return obj as T;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`TheMovieDB API error: ${response.status}`);
    }

    const data = await response.json();
    return this.mapKeysToCamelCase<T>(data);
  }

  async searchMovie(query: string, language = 'pt-BR'): Promise<SearchMovieResponse> {
    return this.fetch<SearchMovieResponse>(
      `search/movie?query=${encodeURIComponent(query)}&language=${language}`
    );
  }

  async getMovieDetails(movieId: number, language = 'pt-BR'): Promise<MovieDetailsResponse> {
    return this.fetch<MovieDetailsResponse>(
      `movie/${movieId}?language=${language}`
    );
  }

  async getMovieProviders(movieId: number): Promise<MovieProvidersResponse> {
    return this.fetch<MovieProvidersResponse>(
      `movie/${movieId}/watch/providers`
    );
  }

  getPosterUrl(posterPath: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!posterPath) return null;
    return `${this.imageBaseUrl}/${size}${posterPath}`;
  }

  getBackdropUrl(backdropPath: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
    if (!backdropPath) return null;
    return `${this.imageBaseUrl}/${size}${backdropPath}`;
  }

  formatRuntime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  }

  formatCurrency(value: number): string {
    if (value === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}

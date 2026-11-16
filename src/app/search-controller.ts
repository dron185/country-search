import { debounce } from '../core/debounce.js';
import { searchCountries } from '../core/search-countries.js';
import { HttpError } from '../core/http-error.js';
import { mapCountryResponse } from '../core/map-country.js';
import type { CountryUI } from '../core/types.js';

export type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: CountryUI[] }
  | { status: 'empty' }
  | { status: 'error'; errorType: 'http' | 'network' | 'unknown'; message: string };

export class SearchController {
  private onStateChange: (state: AppState) => void;
  private currentQuery = '';

  private debouncedSearch = debounce((query: string) => this.executeSearch(query), 300);

  constructor(onStateChange: (state: AppState) => void) {
    this.onStateChange = onStateChange;
  }

  public search(query: string): void {
    this.currentQuery = query;
    if (!query.trim()) {
      this.debouncedSearch.cancel();
      this.onStateChange({ status: 'idle' });
      return;
    }
    this.debouncedSearch(query);
  }

  private async executeSearch(query: string): Promise<void> {
    this.onStateChange({ status: 'loading' });
    try {
      const rawData = await searchCountries(query, new AbortController().signal); // Пока без отмены
      if (!rawData || rawData.length === 0) {
        this.onStateChange({ status: 'empty' });
        return;
      }
      const mapped = rawData.map(mapCountryResponse);
      this.onStateChange({ status: 'success', data: mapped });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        this.onStateChange({
          status: 'error',
          errorType: 'http',
          message: `Ошибка сервера: ${error.status}`,
        });
      } else {
        this.onStateChange({
          status: 'error',
          errorType: 'network',
          message: 'Ошибка сети',
        });
      }
    }
  }

  // Метод для кнопки "Повторить"
  public retry(): void {
    if (this.currentQuery) this.executeSearch(this.currentQuery);
  }
}

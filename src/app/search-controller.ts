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
  private currentAbortController: AbortController | null = null;

  private debouncedSearch = debounce((query: string) => {
    void this.executeSearch(query);
  }, 300);

  constructor(onStateChange: (state: AppState) => void) {
    this.onStateChange = onStateChange;
  }

  public search(query: string): void {
    this.currentQuery = query;

    // 1. Отменяем активный запрос при каждом изменении ввода (до дебаунса)
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }

    // 2. Если поле очищено - отменяем отложенный дебаунс и сбрасываем состояние
    if (!query.trim()) {
      this.debouncedSearch.cancel();
      this.onStateChange({ status: 'idle' });
      return;
    }

    // 3. Запускаем дебаунс
    this.debouncedSearch(query);
  }

  public retry(): void {
    if (this.currentQuery.trim()) {
      void this.executeSearch(this.currentQuery);
    }
  }

  private async executeSearch(query: string): Promise<void> {
    this.onStateChange({ status: 'loading' });

    // Создаем собственный контроллер для этого конкретного запроса
    const controller = new AbortController();
    this.currentAbortController = controller;

    // Комбинируем сигнал ручной отмены и сигнал таймаута (5 секунд)
    const timeoutSignal = AbortSignal.timeout(5000);
    const combinedSignal = AbortSignal.any([controller.signal, timeoutSignal]);

    try {
      const rawData = await searchCountries(query, combinedSignal);

      // Если пока мы ждали ответ, пользователь ввел новый запрос - игнорируем старый результат
      if (this.currentAbortController !== controller) return;

      if (!rawData || rawData.length === 0) {
        this.onStateChange({ status: 'empty' });
        return;
      }

      const mapped = rawData.map(mapCountryResponse);
      this.onStateChange({ status: 'success', data: mapped });
    } catch (error: unknown) {
      // Если запрос был отменен или упал по таймауту - обрабатываем отдельно
      if (error instanceof DOMException) {
        if (error.name === 'AbortError') {
          // Это наша собственная отмена (пользователь ввел новый текст). Молчим.
          return;
        }
        if (error.name === 'TimeoutError') {
          if (this.currentAbortController === controller) {
            this.onStateChange({
              status: 'error',
              errorType: 'network',
              message: 'Превышено время ожидания (5 сек)',
            });
          }
          return;
        }
      }

      // Если это не текущий запрос - игнорируем ошибку
      if (this.currentAbortController !== controller) return;

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
          message: 'Ошибка сети. Проверьте подключение.',
        });
      }
    } finally {
      // Очищаем контроллер только если он всё еще актуален
      if (this.currentAbortController === controller) {
        this.currentAbortController = null;
      }
    }
  }
}

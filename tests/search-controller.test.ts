import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { SearchController } from '../src/app/search-controller.js';
import { HttpError } from '../src/core/http-error.js';

// Мокаем модуль searchCountries, чтобы контроллер не делал реальных запросов
vi.mock('../src/core/search-countries.js', () => ({
  searchCountries: vi.fn(),
}));

import { searchCountries } from '../src/core/search-countries.js';

describe('SearchController Error Handling', () => {
  let controller: SearchController;
  let onStateChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    onStateChangeMock = vi.fn();
    controller = new SearchController(onStateChangeMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('sets state to "empty" on 404 (empty array)', async () => {
    vi.mocked(searchCountries).mockResolvedValue([]);
    controller.search('unknown');
    await vi.runAllTimersAsync();

    expect(onStateChangeMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'empty' }),
    );
  });

  it('sets state to "error" on HttpError (500)', async () => {
    vi.mocked(searchCountries).mockRejectedValue(new HttpError(500));
    controller.search('error');
    await vi.runAllTimersAsync();

    expect(onStateChangeMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'error', errorType: 'http' }),
    );
  });

  it('sets state to "error" on network error', async () => {
    vi.mocked(searchCountries).mockRejectedValue(new TypeError('Failed to fetch'));
    controller.search('error');
    await vi.runAllTimersAsync();

    expect(onStateChangeMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'error', errorType: 'network' }),
    );
  });
});

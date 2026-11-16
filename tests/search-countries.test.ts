import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { searchCountries } from '../src/core/search-countries.js';
import { HttpError } from '../src/core/http-error.js';

describe('searchCountries', () => {
  const originalFetch = globalThis.fetch;
  const controller = new AbortController();

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('calls the correct endpoint and returns data on 200', async () => {
    const mockData = [{ name: 'Spain' }];
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 }),
    );

    const result = await searchCountries('spain', controller.signal);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://countries.dev/name/spain',
      expect.objectContaining({ signal: controller.signal }),
    );
    expect(result).toEqual(mockData);
  });

  it('returns an empty array on 404 (no matches)', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response('', { status: 404 }));

    const result = await searchCountries('unknown', controller.signal);
    expect(result).toEqual([]);
  });

  it('throws HttpError on 500', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response('', { status: 500 }));

    await expect(searchCountries('error', controller.signal)).rejects.toThrow(HttpError);

    // Проверяем, что статус сохранился в ошибке
    try {
      await searchCountries('error', controller.signal);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpError);
      expect((e as HttpError).status).toBe(500);
    }
  });
});

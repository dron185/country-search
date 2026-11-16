import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from '../src/core/map-country.js';

describe('mapCountryResponse', () => {
  it('maps raw API data to a UI-friendly format', () => {
    const raw = {
      name: 'Spain',
      flags: { svg: 'https://flag.url/es.svg' },
      capital: 'Madrid',
      region: 'Europe',
      population: 47351567,
      languages: [{ name: 'Spanish' }],
      currencies: [{ name: 'Euro' }],
      area: 505992,
      borders: ['FRA', 'PRT'],
      description: 'Spain is a country in Europe.',
    };

    const result = mapCountryResponse(raw);

    expect(result).toEqual({
      name: 'Spain',
      flagUrl: 'https://flag.url/es.svg',
      capital: 'Madrid',
      region: 'Europe',
      population: '47,351,567', // Форматируем население для UI
      languages: ['Spanish'],
      currencies: ['Euro'],
      area: 505992,
      borders: ['FRA', 'PRT'],
      description: 'Spain is a country in Europe.',
    });
  });

  it('handles missing optional fields gracefully', () => {
    const raw = {
      name: 'Test',
      flags: { svg: 'url' },
      population: 100,
      languages: [],
      currencies: [],
    };
    const result = mapCountryResponse(raw);
    expect(result.capital).toBe('Нет данных');
    expect(result.languages).toEqual([]);
  });
});

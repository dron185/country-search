import type { CountryUI, RawCountry } from './types.js';

export function mapCountryResponse(raw: RawCountry): CountryUI {
  return {
    name: raw.name || 'Неизвестно',
    flagUrl: raw.flags?.svg || '',
    capital: raw.capital || 'Нет данных',
    region: raw.region || 'Нет данных',
    population: raw.population ? raw.population.toLocaleString('en-US') : '0',
    languages: raw.languages?.map((l) => l.name) || [],
    currencies: raw.currencies?.map((c) => c.name) || [],
    area: raw.area || 0,
    borders: raw.borders || [],
    description: raw.description || 'Описание отсутствует',
  };
}

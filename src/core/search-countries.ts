import { HttpError } from './http-error.js';

export async function searchCountries(
  query: string,
  signal: AbortSignal,
): Promise<unknown[]> {
  const url = `https://countries.dev/name/${encodeURIComponent(query)}`;
  const response = await fetch(url, { signal });

  if (response.status === 404) {
    return []; // 404 - это не ошибка, просто нет совпадений
  }

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  return response.json();
}

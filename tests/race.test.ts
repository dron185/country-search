import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { SearchController, type AppState } from '../src/app/search-controller.js';

describe('Race condition handling', () => {
  let controller: SearchController;
  let states: AppState[];
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    states = [];
    controller = new SearchController((state) => states.push(state));

    // Сложный мок fetch, который умеет отменяться
    fetchMock = vi.fn((url: string, options?: RequestInit) => {
      return new Promise((resolve, reject) => {
        const isSpain = url.includes('spain');
        const delay = isSpain ? 100 : 500; // spain быстрее, sp медленнее

        const timeout = setTimeout(() => {
          resolve(
            new Response(JSON.stringify([{ name: isSpain ? 'Spain' : 'Sp' }]), {
              status: 200,
            }),
          );
        }, delay);

        if (options?.signal) {
          options.signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }
      });
    });
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('cancels the first request and shows only the latest result', async () => {
    // 1. Печатаем 'sp' (уходит в debounce)
    controller.search('sp');
    await vi.advanceTimersByTimeAsync(300); // debounce прошел, fetch('sp') запущен (задержка 500мс)

    // 2. Печатаем 'spain'
    controller.search('spain');
    // Ожидаем, что 'sp' будет отменен СРАЗУ при вводе 'spain', а не через 300мс

    await vi.advanceTimersByTimeAsync(300); // debounce для 'spain' прошел, fetch('spain') запущен

    // Промис для 'spain' резолвится через 100мс, 'sp' должен был быть отменен
    await vi.advanceTimersByTimeAsync(100);

    // Ждем, пока 'sp' (если бы не был отменен) резолвился (еще 400мс)
    await vi.advanceTimersByTimeAsync(400);

    const finalState = states[states.length - 1];

    // Проверяем, что последнее состояние - успех с Испанией
    expect(finalState?.status).toBe('success');
    if (finalState?.status === 'success') {
      expect(finalState.data[0]?.name).toBe('Spain');
    }

    // Проверяем, что мы не отобразили 'Sp' (не было состояния success с 'Sp')
    const hasStaleSuccess = states.some(
      (s) => s.status === 'success' && s.data[0]?.name === 'Sp',
    );
    expect(hasStaleSuccess).toBe(false);
  });
});

export type Debounced<A extends unknown[]> = {
  (...args: A): void;
  cancel: () => void;
};

/**
 * Задерживает вызов `fn` на `delay` мс; повторный вызов сбрасывает таймер.
 * Возвращаемая функция имеет метод `.cancel()` — отменяет запланированный вызов.
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number,
): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: A): void => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delay);
  };

  debounced.cancel = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}

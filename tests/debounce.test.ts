import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../src/core/debounce.js';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('does not call fn before the delay elapses', () => {
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d();
    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();
  });

  it('calls fn exactly once after the delay', () => {
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets the timer when called again within the delay', () => {
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d();
    vi.advanceTimersByTime(200);
    d(); // сброс таймера
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled(); // ещё рано
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes all arguments through to fn', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d('spain', 42);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('spain', 42);
  });

  it('cancel() prevents the scheduled call', () => {
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d();
    d.cancel();
    vi.advanceTimersByTime(10_000);
    expect(fn).not.toHaveBeenCalled();
  });
});

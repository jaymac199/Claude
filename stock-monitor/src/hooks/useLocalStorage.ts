import { useCallback, useEffect, useState } from 'react';

/**
 * State that persists to localStorage. Used for notes and UI preferences so they
 * survive refreshes. Falls back to in-memory state if storage is unavailable.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
  }, [key, value]);

  const update = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);

  return [value, update] as const;
}

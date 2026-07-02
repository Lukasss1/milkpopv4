import { useState, useEffect } from 'react';
import { schedulePush } from '../lib/cloudSync';

/**
 * Persistent state hook: writes to localStorage instantly (offline-first) and,
 * when a Supabase connection is configured, mirrors every change to the cloud
 * through the debounced sync engine. One state — two homes.
 */
export function useLocalStorageState<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        let valueStr = stored;
        if (valueStr.includes('Merry Hill') || valueStr.includes('MerryHill')) {
            valueStr = valueStr.replace(/Merry Hill/g, 'Solihull').replace(/MerryHill/g, 'Solihull');
            localStorage.setItem(key, valueStr);
        }
        return JSON.parse(valueStr);
      }
    } catch (e) {
      console.warn(`Unable to load localStorage for key ${key}`, e);
    }

    if (initialValue instanceof Function) {
      return (initialValue as () => T)();
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      schedulePush(key, state);
    } catch (e) {
      console.warn(`Storage quota error for key ${key}`, e);
    }
  }, [key, state]);

  return [state, setState];
}

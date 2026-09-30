'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * A boolean mirrored into `localStorage`, readable during the first client
 * render.
 *
 * The obvious implementation — `useEffect(() => setValue(read()), [])` plus a
 * write effect — cascades an extra render on every mount and trips React's
 * `set-state-in-effect` rule. This reads through `useSyncExternalStore`
 * instead, so the stored value is part of the very first client render.
 *
 * Hydration: `getServerSnapshot` returns `fallback`, so the server-rendered HTML
 * always matches the first client render. If the stored value differs, React
 * re-renders immediately after hydration, which is the correct behaviour here —
 * the preference is a real, user-owned value, not decoration.
 */

type Store = {
  key: string;
  listeners: Set<() => void>;
};

const stores = new Map<string, Store>();

function getStore(key: string): Store {
  const existing = stores.get(key);

  if (existing) return existing;

  const store: Store = { key, listeners: new Set() };
  stores.set(key, store);

  return store;
}

/**
 * Notifies subscribers in this tab *and* others.
 *
 * The `storage` event only fires in sibling tabs, so a write that only called
 * the local listeners would leave another open tab showing stale state.
 */
function emit(store: Store) {
  for (const listener of store.listeners) listener();
}

export function useStoredBoolean(
  key: string,
  fallback = false,
): [boolean, (next: boolean) => void] {
  const store = getStore(key);

  const subscribe = useCallback(
    (onChange: () => void) => {
      store.listeners.add(onChange);

      const onStorage = (event: StorageEvent) => {
        if (event.key === store.key) onChange();
      };

      window.addEventListener('storage', onStorage);

      return () => {
        store.listeners.delete(onChange);
        window.removeEventListener('storage', onStorage);
      };
    },
    [store],
  );

  const read = useCallback(() => {
    try {
      return window.localStorage.getItem(store.key) === 'true';
    } catch {
      // Private browsing or a disabled-storage policy: fall back rather than
      // throwing during render.
      return fallback;
    }
  }, [store, fallback]);

  const value = useSyncExternalStore(subscribe, read, () => fallback);

  const setValue = useCallback(
    (next: boolean) => {
      try {
        window.localStorage.setItem(store.key, String(next));
      } catch {
        // Storage is unavailable; the in-memory value still updates below.
      }

      emit(store);
    },
    [store],
  );

  return [value, setValue];
}

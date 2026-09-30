'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {
  /* Nothing ever changes, so this store is permanently "hydrated". */
};

/**
 * `false` while server-rendering and during the first client render, `true`
 * afterwards.
 *
 * Used for UI that genuinely cannot be rendered on the server — the theme
 * switcher, for example, because the visitor's stored preference is only
 * available in the browser. Implemented with `useSyncExternalStore` rather than
 * the usual `useEffect(() => setMounted(true), [])` so there is no extra render
 * pass and React's hydration rules stay satisfied.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

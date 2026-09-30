import { useEffect, useState } from 'react';

/**
 * Debounce a rapidly-changing value.
 *
 * Used by the project search box, where writing to the URL on every keystroke
 * would push a history entry per character and make Back useless. The trailing
 * edge wins: the value settles once the visitor pauses.
 *
 * The pending timer is cleared on unmount *and* whenever a new value arrives, so
 * a component that unmounts mid-debounce cannot set state on a dead component.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

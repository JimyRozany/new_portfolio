/**
 * Tiny async helper used by Server Components.
 *
 * It replaces the long `try { … } catch { … }` dance with one expression while
 * still letting callers provide a safe fallback value.
 */
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
  fallback: T,
  onError?: (error: E) => void,
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    onError?.(error as E);
    return fallback;
  }
}

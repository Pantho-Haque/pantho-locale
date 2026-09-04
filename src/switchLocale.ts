/**
 * Module-scoped active language + listener channel.
 *
 * The package exposes one mutable concept: the currently active language.
 * `switchLocale(...)` mutates it; `subscribe` / `getActiveLang` let React
 * hooks observe changes via `useSyncExternalStore`.
 *
 * SSR safety: `getActiveLang` is called during render and must be
 * deterministic. We keep `activeLang` as a plain `string | undefined`
 * so server and client agree on `undefined` until `switchLocale` fires
 * on the client (which is exactly when re-renders are valid).
 */

let activeLang: string | undefined;

const listeners = new Set<() => void>();

/** Subscribe to active-lang changes. Returns an unsubscribe fn. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Read the current active language. Returns `undefined` until
 * `switchLocale` has been called for the first time.
 */
export function getActiveLang(): string | undefined {
  return activeLang;
}

/**
 * Set the package's active language and notify all subscribers.
 *
 * The argument is a key from the map last passed to `setLocales(...)`.
 * Unknown values are accepted — they fall back to the empty bundle the
 * same way `getTranslation(unknown)` does. This keeps the API permissive
 * and matches the rest of the package.
 *
 * Idempotent: calling with the current active value is a no-op (no
 * listener notifications, no re-renders).
 */
export function switchLocale(lang: string): void {
  if (lang === activeLang) return;
  activeLang = lang;
  // Snapshot first — listeners may unsubscribe themselves during the
  // notification, and mutating the Set mid-iteration would skip them.
  for (const listener of [...listeners]) {
    listener();
  }
}

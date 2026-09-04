import { useMemo, useSyncExternalStore } from "react";
import { getTranslation } from "./getTranslation";
import {
  getActiveLang,
  subscribe as subscribeActiveLang,
} from "./switchLocale";
import type { TranslationData } from "./types";

/**
 * React hook: returns the translation bundle for the given language,
 * or — when called with no argument — for the package's currently
 * active language (set via `switchLocale`).
 *
 * Two modes:
 *
 * - **Explicit** — `useTranslation('en')` is memoized on `'en'`. Same
 *   language produces a stable object reference across re-renders.
 *   Switching the argument swaps the reference.
 *
 * - **Active** — `useTranslation()` subscribes to the active language
 *   and returns `getTranslation(activeLang)`. Components re-render
 *   automatically when `switchLocale(...)` is called.
 */
export function useTranslation<T extends object = TranslationData>(
  lang?: string,
): T {
  if (lang === undefined) {
    // `useSyncExternalStore` requires the snapshot getter to return the
    // same value across calls when nothing has changed. Our snapshot is
    // `activeLang ?? ''` so SSR (where activeLang is undefined) and the
    // first client render agree before any `switchLocale` fires.
    const active = useSyncExternalStore(
      subscribeActiveLang,
      getActiveLang,
      () => undefined,
    );
    return getTranslation<T>(active ?? "");
  }

  return useMemo(() => getTranslation<T>(lang), [lang]);
}

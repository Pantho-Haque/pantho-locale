import bn from "./locales/bn";
import en from "./locales/en";
import ne from "./locales/ne";
import type { TranslationData } from "./types";

/** Shared empty fallback for unknown languages. Frozen so it can't be mutated. */
const EMPTY: TranslationData = Object.freeze({});

/**
 * Locale registry. Adding a new language means:
 *   1. drop a `src/locales/<code>.ts` that exports the locale object as default
 *   2. import it here
 *   3. add it to this map
 *
 * These entries are the default sample bundles. Consumers that need to
 * translate their own data should call `setLocales(...)` once at app
 * startup to replace the entire map — see the README.
 */
let locales: Record<string, TranslationData> = {
  en,
  bn,
  ne,
};

/**
 * Replace the package's locale registry with the consumer's bundles.
 *
 * The new map **replaces** the existing entries wholesale — it does
 * not merge. Pass every locale you want available; anything missing
 * from `next` will fall back to the empty bundle.
 *
 * This is intended as one-shot app startup configuration. It does
 * not invalidate previously memoized `useTranslation` results — if a
 * consumer swaps locales at runtime, they should pass `lang` as
 * reactive state so React re-runs the hook.
 *
 * @example
 * ```ts
 * import { setLocales } from "@pantho075/locale";
 * import { en } from "./locales/en";
 * import { bn } from "./locales/bn";
 *
 * setLocales({ en, bn });
 * ```
 */
export function setLocales<T extends object = TranslationData>(
  next: Record<string, T>,
): void {
  locales = next as unknown as Record<string, TranslationData>;
}

/**
 * Returns the translation bundle for the given language code.
 * Unknown / undefined / empty values fall back to a stable empty object.
 *
 * Framework-agnostic: works in React, Next.js server components, Vue,
 * Svelte, or vanilla Node scripts.
 */
export function getTranslation<T extends object = TranslationData>(
  lang: string,
): T {
  return (locales[lang] ?? EMPTY) as T;
}

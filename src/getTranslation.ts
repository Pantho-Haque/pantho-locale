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
 */
const locales: Record<string, TranslationData> = {
  en,
  bn,
  ne,
};

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

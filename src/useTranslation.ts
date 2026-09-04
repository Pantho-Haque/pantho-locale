import { useMemo } from "react";
import { getTranslation } from "./getTranslation";
import type { TranslationData } from "./types";

/**
 * React hook: returns the translation bundle for the given language.
 *
 * Memoized on `lang`, so the same language produces a stable object
 * reference across re-renders. Switching language swaps the reference
 * (and any consumers destructuring top-level keys will re-render).
 */
export function useTranslation<T extends object = TranslationData>(
  lang: string,
): T {
  return useMemo(() => getTranslation<T>(lang), [lang]);
}

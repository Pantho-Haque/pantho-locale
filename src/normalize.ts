import type { TranslationData } from "./types";

/**
 * Wrap a translation bundle in a Proxy that returns `null` for any
 * missing top-level key, while leaving nested objects untouched so
 * missing nested keys still resolve to `undefined` (standard JS
 * semantics).
 *
 * Explicit `null` values in the source are preserved.
 */
export function withNullTopLevel<T extends TranslationData>(data: T): T {
  return new Proxy(data, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && !(prop in target)) {
        return null;
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as T;
}

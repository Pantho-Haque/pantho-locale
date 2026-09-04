# @pantho075/locale

Tiny framework-agnostic i18n core. Translation data lives in TypeScript, not JSON. No provider, no context, no runtime detection. Works in React, Next.js, Vue, Svelte, and Node.

```tsx
import { useTranslation } from "@pantho075/locale";

export function Example() {
  const { title, home } = useTranslation("en");
  return (
    <div>
      <div>{title}</div>
      <div>{home.header}</div>
      <div>{home.footer}</div>
    </div>
  );
}
```

The example above uses the package's built-in sample bundles (`en`, `bn`, `ne`). For real apps you'll want to use your own data — see [Using your own translations](#using-your-own-translations) below.

## Install

```bash
pnpm add @pantho075/locale
```

React is an **optional** peer dependency — install it in your app if you're using `useTranslation`. The core `getTranslation` function works in any JS runtime.

## Quick start

### React / Next.js (client component)

```tsx
import { useTranslation } from "@pantho075/locale";

export function Greeting({ lang }: { lang: string }) {
  const { title, home } = useTranslation(lang);
  return (
    <div>
      <h1>{title}</h1>
      <p>{home.header}</p>
      <p>{home.footer}</p>
    </div>
  );
}
```

### Next.js (server component) / Vue / Svelte / Node

```ts
import { getTranslation } from "@pantho075/locale";

const { title, home } = getTranslation("en");
console.log(title, home.header, home.footer);
```

## Using your own translations

The package ships with three sample locales for demo purposes. To use your own translation data, call `setLocales(...)` once at app startup with a map of language code → bundle. After that, `getTranslation` and `useTranslation` return your data.

```ts
// src/translations.ts
import { setLocales } from "@pantho075/locale";
import en from "./locales/en";
import bn from "./locales/bn";

setLocales({ en, bn });
```

Then anywhere in your app:

```ts
import { useTranslation } from "@pantho075/locale";

function Greeting({ lang }: { lang: string }) {
  const t = useTranslation<typeof en>(lang);
  return <h1>{t.title}</h1>;
}
```

### Semantics

- **`setLocales` replaces the entire map** — it does not merge. If you call `setLocales({ en })`, the previous `bn`/`ne` entries are gone and will return `{}`. Pass every locale you want available.
- **One-shot setup.** Call `setLocales` at app startup. Calling it later does not invalidate previously memoized `useTranslation` results — if you need to swap locales at runtime, hold `lang` in reactive state and let React re-run the hook.
- **Missing languages return `{}`** (the same frozen empty object every time — safe to compare with `===`).
- **Missing keys return `undefined`** — standard JS object semantics. No proxy wrapping.

### Adding a new locale

You don't need to touch this package's source. Just add a file in your app and register it via `setLocales`:

```ts
// src/locales/ja.ts
export default {
  title: "こんにちは",
  home: { header: "ヘッダー", footer: "フッター" },
};
```

```ts
// src/translations.ts
import { setLocales } from "@pantho075/locale";
import en from "./locales/en";
import ja from "./locales/ja";

setLocales({ en, ja });
```

## Language switching

The hooks accept any `string` for `lang`, but for a real app you'll usually want a constrained set of codes, a default fallback, and a UI control to switch between them. Build those once in your app — the package doesn't ship them because they tend to be tied to your auth/session model.

### Typing the supported codes

```ts
// src/i18n/lang.ts

/** Matches `AuthUser.lang` from the verify-token response. */
export type Lang = "en" | "bn" | "ne";

export const SUPPORTED_LANGS: readonly Lang[] = ["en", "bn", "ne"] as const;
export const DEFAULT_LANG: Lang = "en";

/**
 * Narrow an arbitrary value (e.g. `useAuthStore((s) => s.user?.lang)`,
 * which is `Lang | undefined`) to one of our `Lang` codes, falling back
 * to `DEFAULT_LANG`. Pass the result to `getTranslation` / `useTranslation`.
 */
export function resolveLang(value: unknown): Lang {
  return typeof value === "string" &&
    (SUPPORTED_LANGS as readonly string[]).includes(value)
    ? (value as Lang)
    : DEFAULT_LANG;
}
```

### Reading translations in components

```tsx
// src/components/Greeting.tsx
import { useTranslation } from "@pantho075/locale";
import type { Translations } from "@/types/localeTypes";
import { resolveLang } from "@/i18n/lang";
import { useAuthStore } from "@/stores/auth";

export function Greeting() {
  const lang = useAuthStore((s) => s.user?.lang);
  const t = useTranslation<Translations>(resolveLang(lang));
  return <h1>{t.title}</h1>;
}
```

…and in non-React / server code:

```ts
import { getTranslation } from "@pantho075/locale";
import { resolveLang } from "@/i18n/lang";
import type { Translations } from "@/types/localeTypes";

export async function loadGreeting() {
  const { loading } = getTranslation<Translations>(resolveLang("bn"));
  return loading;
}
```

### Switching languages at runtime

The package ships `switchLocale(lang)` — call it and every component using `useTranslation()` (no argument) re-renders with the new bundle. Combined with `setLocales(...)` at startup, this is the whole switching story.

```tsx
// src/components/LanguageSwitcher.tsx
import { switchLocale } from "@pantho075/locale";
import { useAuthStore } from "@/stores/auth";
import type { Lang } from "@/i18n/lang";

const LABELS: Record<Lang, string> = {
  en: "English",
  bn: "বাংলা",
  ne: "नेपाली",
};

export function LanguageSwitcher() {
  const user = useAuthStore((s) => s.user);

  return (
    <select
      value={user?.lang ?? "en"}
      onChange={(e) => {
        const next = e.target.value as Lang;
        // Persist to your auth store / cookie / localStorage…
        useAuthStore.setState((s) => ({
          user: s.user ? { ...s.user, lang: next } : s.user,
        }));
        // And tell the package. Components using useTranslation() with no
        // argument re-render automatically.
        switchLocale(next);
      }}
    >
      {(Object.keys(LABELS) as Lang[]).map((code) => (
        <option key={code} value={code}>{LABELS[code]}</option>
      ))}
    </select>
  );
}
```

Components don't need to change. They call `useTranslation()` with no argument:

```tsx
// was: const t = useTranslation<Translations>(lang);
// now: same hook, no arg → subscribes to the active lang
const t = useTranslation<Translations>();
return <h1>{t.title}</h1>;
```

`useTranslation` keeps its existing `(lang)` signature for callers that want to pin a language. The two modes coexist — explicit arg wins over the active lang.

## API

### `getTranslation<T>(lang: string): T`

Framework-agnostic. Returns the bundle for the requested language, or `{}` for unknown languages. The same empty object reference is returned every time, so you can safely use `===` comparisons.

The optional generic lets consumers constrain the return type:

```ts
interface English {
  title: string;
  home: { header: string; footer: string };
}

const en = getTranslation<English>("en");
```

### `useTranslation<T>(lang?: string): T`

React hook wrapping `getTranslation`. Two modes:

- **Explicit** — `useTranslation('en')` is memoized on `'en'`. Same language returns the same object reference across re-renders.
- **Active** — `useTranslation()` (no argument) subscribes to the package's currently active language and returns `getTranslation(activeLang)`. Components re-render automatically when `switchLocale(...)` is called.

```ts
import { useTranslation } from "@pantho075/locale";

const { title } = useTranslation("en");      // explicit, pinned
const t = useTranslation<English>();         // active, subscribes
```

### `switchLocale(lang: string): void`

Sets the package's active language and notifies every `useTranslation()` subscriber to re-render. Idempotent: calling with the current value is a no-op. Unknown values are accepted and fall back to the empty bundle the same way `getTranslation(unknown)` does.

```ts
import { switchLocale } from "@pantho075/locale";

switchLocale("bn");
```

See [Switching languages at runtime](#switching-languages-at-runtime).

### `setLocales<T>(locales: Record<string, T>): void`

Replaces the package's internal locale registry. Call once at app startup to swap in your own bundles. See [Using your own translations](#using-your-own-translations).

### `TranslationData`

The default return type — `Record<string, unknown>`. Most consumers will constrain this with their own interface via the generic.

## Why no JSON files?

Translation data is just regular TypeScript that gets tree-shaken and bundled like any other code. `setLocales` lets your app own its own locale files without forking the package or shipping JSON.

## License

MIT

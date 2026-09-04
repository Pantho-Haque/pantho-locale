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

### `useTranslation<T>(lang: string): T`

React hook wrapping `getTranslation`. Memoized on `lang` — same language returns the same object reference across re-renders.

```ts
import { useTranslation } from "@pantho075/locale";

const { title } = useTranslation("en"); // string | undefined
const en = useTranslation<English>("en"); // typed
```

### `setLocales<T>(locales: Record<string, T>): void`

Replaces the package's internal locale registry. Call once at app startup to swap in your own bundles. See [Using your own translations](#using-your-own-translations).

### `TranslationData`

The default return type — `Record<string, unknown>`. Most consumers will constrain this with their own interface via the generic.

## Why no JSON files?

Translation data is just regular TypeScript that gets tree-shaken and bundled like any other code. `setLocales` lets your app own its own locale files without forking the package or shipping JSON.

## License

MIT

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

### Adding your own keys

Edit `src/locales/en.ts` (and `bn.ts`, `ne.ts`) in this package, or fork it. Each file is just a `const data = { ... }` wrapped in `withNullTopLevel`:

```ts
// src/locales/en.ts
import { withNullTopLevel } from "../normalize";

const data = {
  title: "Welcome",
  home: {
    header: "Hello",
    footer: "Goodbye",
  },
  greeting: "Hi there",
};

export default withNullTopLevel(data);
```

### Adding a new locale

1. Create `src/locales/<code>.ts` that exports `withNullTopLevel(...)`.
2. Import it in `src/getTranslation.ts` and add it to the `locales` map.

## Missing-value semantics

This is important — read it.

| Situation                                | Returned value                              |
| ---------------------------------------- | ------------------------------------------- |
| Top-level key is **absent** from source  | `null` (Proxy returns null on miss)         |
| Nested key is **absent** from source     | `undefined` (standard JS)                   |
| Key is present with value `null`         | `null`                                      |
| Key is present with a string/object/etc. | that value                                  |

So:

- `useTranslation('en').totallyMissing` → `null`
- `useTranslation('en').home.missing` → `undefined`
- `useTranslation('en').home.footer` (where `home.footer` isn't in source) → `undefined`

If you need `null` for a missing nested key, write it explicitly in the source:

```ts
const data = {
  home: {
    header: "Hello",
    footer: null, // explicit null, not "missing"
  },
};
```

The Proxy only wraps the **top level**. Nested objects are returned by reference, so they keep standard JS behavior — missing nested keys read as `undefined` and you can iterate them with `Object.keys()` etc.

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

const { title } = useTranslation("en"); // string | null
const en = useTranslation<English>("en"); // typed
```

### `TranslationData`

The default return type — `Record<string, unknown>`. Most consumers will constrain this with their own interface via the generic.

## Why no JSON files?

Because the package ships its own locale data, it doesn't need to scan the consumer's filesystem, doesn't need a bundler alias, and doesn't need `resolveJsonModule`. The data is just regular TypeScript that gets tree-shaken and bundled like any other code.

If you want to override locales from your own app, you can fork the package or import the `normalize` helper directly and build your own locale map.

## License

MIT

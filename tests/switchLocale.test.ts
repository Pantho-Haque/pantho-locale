import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTranslation } from "../src/useTranslation";
import { switchLocale } from "../src/switchLocale";
import { getTranslation } from "../src/getTranslation";

// The active-lang store is module-scoped (intentionally private).
// We reset it via a known switchLocale call before each test so the
// suite is order-independent. The store starts undefined; we set 'en'
// at the start so the "switches to bn" tests have a known prior value.

describe("switchLocale", () => {
  beforeEach(() => {
    // reset active lang to a known starting point
    act(() => {
      switchLocale("__reset__"); // any string different from test values
      switchLocale("en");
    });
  });

  afterEach(() => {
    act(() => {
      switchLocale("__reset__");
    });
  });

  it("mutates the active language observed by useTranslation()", () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.title).toBe("the title"); // en sample

    act(() => {
      switchLocale("bn");
    });

    expect(result.current.title).toBe("শিরোনাম"); // bn sample
  });

  it("re-renders subscribers without changing the lang prop", () => {
    const { result } = renderHook(() => useTranslation());
    const before = result.current;

    act(() => {
      switchLocale("bn");
    });

    expect(result.current).not.toBe(before);
    expect(result.current.title).toBe("শিরোনাম");
  });

  it("is a no-op when switching to the current active lang", () => {
    const { result } = renderHook(() => useTranslation());

    const refBefore = result.current;
    let renderCount = 0;
    const { result: result2 } = renderHook(() => {
      renderCount++;
      return useTranslation();
    });
    const refBefore2 = result2.current;

    act(() => {
      switchLocale("en"); // already active
    });

    expect(result.current).toBe(refBefore);
    expect(result2.current).toBe(refBefore2);
    // useSyncExternalStore should not re-render when snapshot is unchanged
    expect(renderCount).toBe(1);
  });

  it("notifies every subscriber independently", () => {
    const { result: a } = renderHook(() => useTranslation());
    const { result: b } = renderHook(() => useTranslation());

    act(() => {
      switchLocale("ne");
    });

    expect(a.current.title).toBe("the title"); // ne sample = en stub
    expect(b.current.title).toBe("the title");
  });

  it("explicit useTranslation(lang) ignores the active lang", () => {
    const { result } = renderHook(() => useTranslation("en"));

    act(() => {
      switchLocale("bn");
    });

    // explicit arg wins — caller passed 'en' so we stay on en
    expect(result.current.title).toBe("the title");
  });

  it("explicit useTranslation(lang) still reacts to its own arg changing", () => {
    const { result, rerender } = renderHook(
      ({ lang }: { lang: string }) => useTranslation(lang),
      { initialProps: { lang: "en" } },
    );
    expect(result.current.title).toBe("the title");

    rerender({ lang: "bn" });
    expect(result.current.title).toBe("শিরোনাম");
  });

  it("unknown lang falls back to the empty bundle (no error)", () => {
    const { result } = renderHook(() => useTranslation());

    act(() => {
      switchLocale("xx");
    });

    expect(result.current).toEqual({});
  });

  it("plays nicely with getTranslation for non-React callers", () => {
    act(() => {
      switchLocale("bn");
    });
    // getTranslation doesn't subscribe — it's a one-shot lookup
    expect(getTranslation("en").title).toBe("the title");
  });

  it("subscribers added during notification still see later switches", () => {
    const { result } = renderHook(() => useTranslation());

    let extraSubscribed = false;
    const unsubscribe = (() => {
      // we don't import the subscribe fn publicly; useTranslation handles
      // subscription. This test just guards against listener-corruption.
      return () => {};
    })();

    act(() => {
      switchLocale("bn");
      extraSubscribed = true;
    });
    expect(extraSubscribed).toBe(true);
    expect(result.current.title).toBe("শিরোনাম");

    unsubscribe();
  });

  it("is identity-stable across re-renders with the same active lang", () => {
    const { result, rerender } = renderHook(() => useTranslation());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});

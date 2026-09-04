import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "../src/useTranslation";

describe("useTranslation", () => {
  it("returns the bundle for the given lang", () => {
    const { result } = renderHook(() => useTranslation("en"));
    expect(result.current.title).toBe("the title");
  });

  it("returns the Bengali bundle for 'bn'", () => {
    const { result } = renderHook(() => useTranslation("bn"));
    expect(result.current.title).toBe("শিরোনাম");
  });

  it("is identity-stable across re-renders with the same lang", () => {
    const { result, rerender } = renderHook(() => useTranslation("en"));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("changes reference when lang changes", () => {
    const { result, rerender } = renderHook(
      ({ lang }: { lang: string }) => useTranslation(lang),
      { initialProps: { lang: "en" } },
    );
    const en = result.current;
    rerender({ lang: "bn" });
    expect(result.current).not.toBe(en);
    expect(result.current.title).toBe("শিরোনাম");
  });

  it("returns {} for unknown languages", () => {
    const { result } = renderHook(() => useTranslation("fr"));
    expect(result.current).toEqual({});
  });

  it("returns {} for undefined lang", () => {
    const { result } = renderHook(() =>
      useTranslation(undefined as unknown as string),
    );
    expect(result.current).toEqual({});
  });

  it("returns undefined for missing keys (standard JS semantics)", () => {
    const { result } = renderHook(() =>
      useTranslation<Record<string, unknown>>("en"),
    );
    expect(result.current.totallyMissing).toBeUndefined();
  });
});

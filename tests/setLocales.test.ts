import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { getTranslation } from "../src/getTranslation";
import { useTranslation } from "../src/useTranslation";
import { setLocales } from "../src/getTranslation";

// Each test sets its own bundles via setLocales, so order doesn't matter.
// We snapshot the registry at the start and restore after each test so
// the existing getTranslation / useTranslation suites are unaffected.

describe("setLocales", () => {
  const original = getTranslation("en");
  // we cannot snapshot the private map directly, so we restore by
  // re-registering the original sample bundles we just observed.
  const sample: Record<string, ReturnType<typeof getTranslation>> = {};

  beforeEach(() => {
    // capture the three built-in sample locales that the package ships with
    sample.en = getTranslation("en");
    sample.bn = getTranslation("bn");
    sample.ne = getTranslation("ne");
  });

  afterEach(() => {
    setLocales(sample);
  });

  it("replaces the registry so consumer bundles are returned", () => {
    const consumerBundle = {
      title: "Welcome",
      home: { header: "Hi", footer: "Bye" },
      chat: { placeholder: "Type…" },
    };
    setLocales({ en: consumerBundle });

    const en = getTranslation<typeof consumerBundle>("en");
    expect(en.title).toBe("Welcome");
    expect(en.home.header).toBe("Hi");
    expect(en.home.footer).toBe("Bye");
    expect(en.chat).toEqual({ placeholder: "Type…" });
  });

  it("removes locales not present in the new map (no merge)", () => {
    setLocales({ en: { title: "only-en" } });

    expect(getTranslation("en").title).toBe("only-en");
    // 'bn' was not in the new map — should fall back to {} not the old bn bundle
    expect(getTranslation("bn")).toEqual({});
    expect(getTranslation("ne")).toEqual({});
  });

  it("supports arbitrary locale codes", () => {
    setLocales({
      "pt-BR": { greeting: "Olá" },
      es: { greeting: "Hola" },
    });

    expect(getTranslation("pt-BR").greeting).toBe("Olá");
    expect(getTranslation("es").greeting).toBe("Hola");
    expect(getTranslation("en")).toEqual({});
  });

  it("accepts an empty map (everything falls back to EMPTY)", () => {
    setLocales({});
    expect(getTranslation("en")).toEqual({});
    expect(getTranslation("bn")).toEqual({});
    expect(getTranslation("fr")).toEqual({});
  });

  it("preserves the EMPTY fallback for unknown languages", () => {
    setLocales({ en: { title: "x" } });
    const fr = getTranslation("fr");
    const xx = getTranslation("xx");
    expect(fr).toEqual({});
    expect(fr).toBe(xx); // identity-stable empty
  });

  it("is consumed by useTranslation", () => {
    setLocales({ en: { title: "Hook sees this" } });

    const { result } = renderHook(() => useTranslation("en"));
    expect(result.current.title).toBe("Hook sees this");
  });

  it("generic type parameter is honored on the consumer side", () => {
    interface ConsumerBundle {
      title: string;
      home: { header: string; footer: string };
    }

    const en: ConsumerBundle = {
      title: "t",
      home: { header: "h", footer: "f" },
    };
    setLocales<ConsumerBundle>({ en });

    const fetched = getTranslation<ConsumerBundle>("en");
    // if generics didn't propagate, this would not typecheck
    const header: string = fetched.home.header;
    expect(header).toBe("h");
  });
});

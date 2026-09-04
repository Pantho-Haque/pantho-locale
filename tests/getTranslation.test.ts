import { describe, it, expect } from "vitest";
import { getTranslation } from "../src/getTranslation";

describe("getTranslation", () => {
  it("returns the English bundle for 'en'", () => {
    const en = getTranslation("en");
    expect(en.title).toBe("the title");
    expect(en.home).toEqual({
      header: "this is header",
      footer: "this is footer",
    });
  });

  it("returns the Bengali bundle for 'bn'", () => {
    const bn = getTranslation("bn");
    expect(bn.title).toBe("শিরোনাম");
  });

  it("returns the Nepali bundle for 'ne' (currently an EN stub)", () => {
    const ne = getTranslation("ne");
    expect(ne.title).toBe("the title");
  });

  it("returns {} for unknown languages", () => {
    expect(getTranslation("fr")).toEqual({});
    expect(getTranslation("xx")).toEqual({});
  });

  it("returns {} for undefined at runtime", () => {
    expect(getTranslation(undefined as unknown as string)).toEqual({});
  });

  it("returns {} for empty string", () => {
    expect(getTranslation("")).toEqual({});
  });

  it("returns the same empty object reference for every unknown lang (identity stable)", () => {
    expect(getTranslation("fr")).toBe(getTranslation("xx"));
    expect(getTranslation("xx")).toBe(getTranslation(undefined as unknown as string));
  });

  it("preserves nested objects untouched", () => {
    const en = getTranslation<{
      home: { header: string; footer: string };
    }>("en");
    expect(en.home).toEqual({
      header: "this is header",
      footer: "this is footer",
    });
  });

  it("returns undefined for missing keys (standard JS semantics)", () => {
    const en = getTranslation<Record<string, unknown>>("en");
    expect(en.totallyMissing).toBeUndefined();
  });
});

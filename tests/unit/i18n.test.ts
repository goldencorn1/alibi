import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, dictionaryFor, normalizeLocale, SUPPORTED_LOCALES } from "@/src/ui/i18n";

describe("UI locale contract", () => {
  it("defaults invalid or missing locale values to Simplified Chinese", () => {
    expect(DEFAULT_LOCALE).toBe("zh-CN");
    expect(normalizeLocale(undefined)).toBe("zh-CN");
    expect(normalizeLocale("fr")).toBe("zh-CN");
    expect(normalizeLocale("en")).toBe("en");
  });

  it("keeps identical typed dictionary keys in both locales", () => {
    const zhKeys = Object.keys(dictionaryFor("zh-CN")).sort();
    const enKeys = Object.keys(dictionaryFor("en")).sort();
    expect(SUPPORTED_LOCALES).toEqual(["zh-CN", "en"]);
    expect(zhKeys).toEqual(enKeys);
    expect(zhKeys.length).toBeGreaterThan(90);
  });
});

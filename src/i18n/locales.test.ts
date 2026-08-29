import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  normalizeLocaleInput,
  resolveLocale,
} from "./locales";

describe("locales", () => {
  it("defines 22 Eighth Schedule supported locales with English as the default", () => {
    expect(SUPPORTED_LOCALES).toEqual([
      "as", "bn", "brx", "doi", "gu", "hi", "kn", "ks", "kok", "mai", "ml", "mni",
      "mr", "ne", "or", "pa", "sa", "sat", "sd", "ta", "te", "ur", "en",
    ]);
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it.each(SUPPORTED_LOCALES)("accepts supported locale %s", (locale) => {
    expect(isSupportedLocale(locale)).toBe(true);
    expect(resolveLocale(locale)).toBe(locale);
  });

  it("rejects unsupported locales", () => {
    expect(isSupportedLocale("fr")).toBe(false);
    expect(isSupportedLocale("english")).toBe(false);
    expect(isSupportedLocale("")).toBe(false);
  });

  it("falls back to the default locale for missing values", () => {
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(null)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("   ")).toBe(DEFAULT_LOCALE);
  });

  it("falls back to the default locale for malformed or invalid values", () => {
    expect(resolveLocale("english")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("en-US")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("123")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("en\nhi")).toBe(DEFAULT_LOCALE);
  });

  it("normalizes locale input before validation", () => {
    expect(normalizeLocaleInput(" HI ")).toBe("hi");
    expect(resolveLocale(" HI ")).toBe("hi");
    expect(resolveLocale("TE")).toBe("te");
  });
});

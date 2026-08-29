import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = {
  value: undefined as string | undefined,
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock("next/headers", () => ({ cookies: vi.fn(async () => cookieStore) }));

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./locales";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_OPTIONS,
  getLocale,
  resolveLocaleFromCookie,
  setLocaleCookie,
} from "./cookie";

describe("locale cookie", () => {
  beforeEach(() => {
    cookieStore.value = undefined;
    cookieStore.get.mockImplementation(() => (cookieStore.value ? { value: cookieStore.value } : undefined));
    cookieStore.set.mockClear();
  });

  it("uses the epfo_locale cookie name", () => {
    expect(LOCALE_COOKIE_NAME).toBe("epfo_locale");
  });

  it("resolves the default locale when the cookie is missing", async () => {
    await expect(getLocale()).resolves.toBe(DEFAULT_LOCALE);
    expect(resolveLocaleFromCookie(undefined)).toBe(DEFAULT_LOCALE);
  });

  it.each(SUPPORTED_LOCALES)("resolves valid cookie value %s", async (locale) => {
    cookieStore.value = locale;
    await expect(getLocale()).resolves.toBe(locale);
    expect(resolveLocaleFromCookie(locale)).toBe(locale);
  });

  it("falls back to the default locale for invalid cookie values", async () => {
    cookieStore.value = "unsupported";
    await expect(getLocale()).resolves.toBe(DEFAULT_LOCALE);
    expect(resolveLocaleFromCookie("unsupported")).toBe(DEFAULT_LOCALE);
    expect(resolveLocaleFromCookie("en-US")).toBe(DEFAULT_LOCALE);
  });

  it("stores supported locales with presentation-only cookie options", async () => {
    await setLocaleCookie("hi");

    expect(cookieStore.set).toHaveBeenCalledWith(LOCALE_COOKIE_NAME, "hi", LOCALE_COOKIE_OPTIONS);
    expect(cookieStore.set.mock.calls[0][2]).toMatchObject({
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: false,
    });
  });
});

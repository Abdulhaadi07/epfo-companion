import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectError = new Error("NEXT_REDIRECT");

const cookieStore = {
  set: vi.fn(),
};

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw redirectError;
  }),
}));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => cookieStore) }));

import { redirect } from "next/navigation";
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_OPTIONS } from "./cookie";
import { setLocaleAction } from "./locale-actions";
import { getDictionary, translate } from "./translate";

describe("setLocaleAction", () => {
  beforeEach(() => {
    vi.mocked(redirect).mockClear();
    cookieStore.set.mockClear();
  });

  it("updates the locale cookie and redirects to the current pathname", async () => {
    const formData = new FormData();
    formData.set("locale", "hi");
    formData.set("returnPath", "/home");
    formData.set("returnSearch", "");

    await expect(setLocaleAction(formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(cookieStore.set).toHaveBeenCalledWith(LOCALE_COOKIE_NAME, "hi", LOCALE_COOKIE_OPTIONS);
    expect(redirect).toHaveBeenCalledWith("/home");
  });

  it("preserves the query string when redirecting", async () => {
    const formData = new FormData();
    formData.set("locale", "te");
    formData.set("returnPath", "/login");
    formData.set("returnSearch", "error=auth");

    await expect(setLocaleAction(formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(cookieStore.set).toHaveBeenCalledWith(LOCALE_COOKIE_NAME, "te", LOCALE_COOKIE_OPTIONS);
    expect(redirect).toHaveBeenCalledWith("/login?error=auth");
  });

  it("rejects invalid locales without updating the cookie", async () => {
    const formData = new FormData();
    formData.set("locale", "english");
    formData.set("returnPath", "/help");
    formData.set("returnSearch", "");

    await expect(setLocaleAction(formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(cookieStore.set).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/help");
  });

  it("falls back to English dictionaries for locales without dedicated dictionaries", () => {
    expect(translate("te", "nav.home")).toBe("Home");
    expect(getDictionary("mr")).toBe(getDictionary("en"));
  });
});

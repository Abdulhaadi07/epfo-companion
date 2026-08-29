import { cookies } from "next/headers";
import { resolveLocale, type Locale } from "./locales";

export const LOCALE_COOKIE_NAME = "epfo_locale";

export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const LOCALE_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
};

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE_NAME)?.value;
  return resolveLocale(value);
}

export async function setLocaleCookie(locale: Locale): Promise<void> {
  (await cookies()).set(LOCALE_COOKIE_NAME, locale, LOCALE_COOKIE_OPTIONS);
}

export function resolveLocaleFromCookie(value: string | null | undefined): Locale {
  return resolveLocale(value ?? undefined);
}

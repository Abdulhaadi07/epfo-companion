export const SUPPORTED_LOCALES = [
  "as",
  "bn",
  "brx",
  "doi",
  "gu",
  "hi",
  "kn",
  "ks",
  "kok",
  "mai",
  "ml",
  "mni",
  "mr",
  "ne",
  "or",
  "pa",
  "sa",
  "sat",
  "sd",
  "ta",
  "te",
  "ur",
  "en",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function normalizeLocaleInput(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveLocale(value: string | null | undefined): Locale {
  if (!value) return DEFAULT_LOCALE;

  const normalized = normalizeLocaleInput(value);
  return isSupportedLocale(normalized) ? normalized : DEFAULT_LOCALE;
}

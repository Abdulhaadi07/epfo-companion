import { dictionaries } from "./dictionaries";
import { enDictionary } from "./dictionaries/en";
import { DEFAULT_LOCALE, type Locale } from "./locales";
import type { TranslationKey } from "./keys";
import type { AvailableDictionaryLocale, Dictionary } from "./types";

export type { TranslationKey } from "./keys";

export type TranslationDictionary = Readonly<Record<TranslationKey, string>>;

const translationKeys = Object.keys(enDictionary) as TranslationKey[];

export function getTranslationKeys(): readonly TranslationKey[] {
  return translationKeys;
}

export function resolveDictionaryLocale(locale: Locale): AvailableDictionaryLocale {
  return locale === "hi" ? "hi" : "en";
}

export function getDictionary(locale: Locale): TranslationDictionary {
  const dictionaryLocale = resolveDictionaryLocale(locale);
  return dictionaries[dictionaryLocale] as TranslationDictionary;
}

export function translate(locale: Locale, key: TranslationKey): string {
  const dictionary = getDictionary(locale);
  const translation = dictionary[key];

  if (translation === undefined) {
    throw new Error(`Missing translation key "${key}" for locale "${resolveDictionaryLocale(locale)}"`);
  }

  return translation;
}

export function assertDictionaryCoverage(
  dictionary: Dictionary,
  referenceKeys: readonly TranslationKey[] = translationKeys,
): void {
  const missingKeys = referenceKeys.filter((key) => dictionary[key] === undefined);

  if (missingKeys.length > 0) {
    throw new Error(`Dictionary is missing keys: ${missingKeys.join(", ")}`);
  }
}

export function assertNoExtraDictionaryKeys(
  dictionary: Dictionary,
  referenceKeys: readonly TranslationKey[] = translationKeys,
): void {
  const referenceSet = new Set<string>(referenceKeys);
  const extraKeys = Object.keys(dictionary).filter((key) => !referenceSet.has(key));

  if (extraKeys.length > 0) {
    throw new Error(`Dictionary has unexpected keys: ${extraKeys.join(", ")}`);
  }
}

export { DEFAULT_LOCALE };

import { getLocale } from "./cookie";
import { getDictionary, translate, type TranslationDictionary, type TranslationKey } from "./translate";
import type { Locale } from "./locales";

export type Translator = (key: TranslationKey) => string;

export type AppTranslator = {
  locale: Locale;
  t: Translator;
  dictionary: TranslationDictionary;
};

export async function getTranslator(): Promise<AppTranslator> {
  const locale = await getLocale();

  return {
    locale,
    t: (key) => translate(locale, key),
    dictionary: getDictionary(locale),
  };
}

export function createTranslator(locale: Locale): AppTranslator {
  return {
    locale,
    t: (key) => translate(locale, key),
    dictionary: getDictionary(locale),
  };
}

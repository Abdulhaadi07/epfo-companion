import { enDictionary } from "./en";
import { hiDictionary } from "./hi";
import type { AvailableDictionaryLocale, Dictionary } from "../types";

export const dictionaries: Readonly<Record<AvailableDictionaryLocale, Dictionary>> = {
  en: enDictionary,
  hi: hiDictionary,
};

export { enDictionary, hiDictionary };

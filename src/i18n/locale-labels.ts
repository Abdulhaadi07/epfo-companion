import { SUPPORTED_LOCALES, type Locale } from "./locales";

export const LOCALE_LABELS = {
  as: "অসমীয়া",
  bn: "বাংলা",
  brx: "बड़ो",
  doi: "डोगरी",
  gu: "ગુજરાતી",
  hi: "हिन्दी",
  kn: "ಕನ್ನಡ",
  ks: "कश्मीरी",
  kok: "कोंकणी",
  mai: "मैथिली",
  ml: "മലയാളം",
  mni: "মৈতৈলোন",
  mr: "मराठी",
  ne: "नेपाली",
  or: "ଓଡ଼ିଆ",
  pa: "ਪੰਜਾਬੀ",
  sa: "संस्कृतम्",
  sat: "ᱥᱟᱱᱛᱟᱲᱤ",
  sd: "سنڌي",
  ta: "தமிழ்",
  te: "తెలుగు",
  ur: "اردو",
  en: "English",
} as const satisfies Record<Locale, string>;

export type LocaleOption = {
  value: Locale;
  label: string;
};

export function getLocaleOptions(): readonly LocaleOption[] {
  const pinned: Locale[] = ["en", "hi"];
  const rest = SUPPORTED_LOCALES.filter((locale) => !pinned.includes(locale));
  return [...pinned, ...rest].map((locale) => ({
    value: locale,
    label: LOCALE_LABELS[locale],
  }));
}

export function getLocaleLabel(locale: Locale): string {
  return LOCALE_LABELS[locale];
}

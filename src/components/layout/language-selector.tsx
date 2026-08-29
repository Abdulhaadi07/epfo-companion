"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { setLocaleAction } from "@/i18n/locale-actions";
import { getLocaleLabel, getLocaleOptions } from "@/i18n/locale-labels";
import type { Locale } from "@/i18n/locales";
import type { AvailableDictionaryLocale } from "@/i18n/types";
import { resolveDictionaryLocale } from "@/i18n/translate";

function isTranslationUnsupported(locale: Locale): boolean {
  return resolveDictionaryLocale(locale) !== (locale as AvailableDictionaryLocale);
}

function LanguageCallout({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const localeLabel = getLocaleLabel(locale);
  const calloutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      ref={calloutRef}
      role="status"
      aria-live="polite"
      className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-lg sm:w-80"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span aria-hidden="true" className="text-lg leading-none text-sky-700">
            ℹ
          </span>
          <div>
            <p className="text-sm font-semibold text-sky-950">
              {localeLabel} — Translation preview
            </p>
            <p className="mt-1 text-xs leading-5 text-sky-900">
              This language is supported for selection, but its translation is not ready in this prototype version. The interface is shown in English for now.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notice"
          className="shrink-0 inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg text-sky-700 transition-colors hover:bg-sky-100"
        >
          <span aria-hidden="true" className="text-lg leading-none">×</span>
        </button>
      </div>
    </div>
  );
}

type LanguageSelectorCoreProps = {
  currentLocale: Locale;
  returnPath: string;
  returnSearch: string;
  languageLabel: string;
  className?: string;
};

export function LanguageSelectorCore({
  currentLocale,
  returnPath,
  returnSearch,
  languageLabel,
  className,
}: LanguageSelectorCoreProps) {
  const options = getLocaleOptions();
  const currentLabel = getLocaleLabel(currentLocale);
  const showCallout = isTranslationUnsupported(currentLocale);
  const [calloutDismissed, setCalloutDismissed] = useState(false);

  return (
    <div className={`relative ${className ?? ""}`}>
      <form action={setLocaleAction}>
        <label htmlFor="language-selector" className="sr-only">
          {languageLabel}
        </label>
        <select
          id="language-selector"
          name="locale"
          defaultValue={currentLocale}
          aria-label={languageLabel}
          title={`${languageLabel}: ${currentLabel}`}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="min-h-11 min-w-[9.5rem] rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input type="hidden" name="returnPath" value={returnPath} />
        <input type="hidden" name="returnSearch" value={returnSearch} />
      </form>
      {showCallout && !calloutDismissed && (
        <LanguageCallout locale={currentLocale} onClose={() => setCalloutDismissed(true)} />
      )}
    </div>
  );
}

function LanguageSelectorWithSearch({
  currentLocale,
  languageLabel,
  className,
}: {
  currentLocale: Locale;
  languageLabel: string;
  className?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <LanguageSelectorCore
      currentLocale={currentLocale}
      returnPath={pathname}
      returnSearch={searchParams.toString()}
      languageLabel={languageLabel}
      className={className}
    />
  );
}

function LanguageSelectorFallback({
  currentLocale,
  languageLabel,
  className,
}: {
  currentLocale: Locale;
  languageLabel: string;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <LanguageSelectorCore
      currentLocale={currentLocale}
      returnPath={pathname}
      returnSearch=""
      languageLabel={languageLabel}
      className={className}
    />
  );
}

type LanguageSelectorProps = {
  currentLocale: Locale;
  languageLabel: string;
  className?: string;
};

export function LanguageSelector({ currentLocale, languageLabel, className }: LanguageSelectorProps) {
  return (
    <Suspense fallback={<LanguageSelectorFallback currentLocale={currentLocale} languageLabel={languageLabel} className={className} />}>
      <LanguageSelectorWithSearch currentLocale={currentLocale} languageLabel={languageLabel} className={className} />
    </Suspense>
  );
}

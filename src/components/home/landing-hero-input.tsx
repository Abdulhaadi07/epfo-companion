"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type LandingHeroInputProps = {
  locale: string;
  questionLabel: string;
  questionPlaceholder: string;
  placeholderAlternate: string;
  continueLabel: string;
  voiceButtonLabel: string;
  voiceTitle: string;
  voiceBody: string;
  voiceDismissLabel: string;
};

export function LandingHeroInput({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locale,
  questionLabel,
  questionPlaceholder,
  placeholderAlternate,
  continueLabel,
  voiceButtonLabel,
  voiceTitle,
  voiceBody,
  voiceDismissLabel,
}: LandingHeroInputProps) {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [phase, setPhase] = useState<"show" | "fade" | "idle">("idle");
  const voicePopoverRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const placeholders = useMemo(
    () => [questionPlaceholder, placeholderAlternate],
    [questionPlaceholder, placeholderAlternate],
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let mounted = true;
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const cycle = () => {
      if (!mounted) return;
      setPhase("show");
      showTimer = setTimeout(() => {
        if (!mounted) return;
        setPhase("fade");
        fadeTimer = setTimeout(() => {
          if (!mounted) return;
          setPlaceholderIndex((i) => (i + 1) % placeholders.length);
          setPhase("show");
          showTimer = setTimeout(() => {
            if (!mounted) return;
            setPhase("idle");
            showTimer = setTimeout(cycle, 1200);
          }, 900);
        }, 700);
      }, 2400);
    };

    const startTimer = setTimeout(cycle, 600);
    return () => {
      mounted = false;
      clearTimeout(startTimer);
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
    };
  }, [placeholders.length]);

  useEffect(() => {
    if (!voiceOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVoiceOpen(false);
      }
    };
    const onClickOutside = (event: MouseEvent) => {
      if (
        wrapRef.current &&
        voicePopoverRef.current &&
        !voicePopoverRef.current.contains(event.target as Node) &&
        !(event.target instanceof Element && wrapRef.current.contains(event.target))
      ) {
        setVoiceOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [voiceOpen]);

  const currentPlaceholder = placeholders[placeholderIndex] ?? questionPlaceholder;
  const fadeClass = phase === "fade"
    ? "transition-opacity duration-700 ease-in-out opacity-40"
    : phase === "show"
      ? "transition-opacity duration-700 ease-in-out opacity-100"
      : "";

  return (
    <form action="/claim/start" className="mt-8 max-w-xl rounded-2xl border border-[var(--border)] bg-slate-50 p-2 shadow-sm sm:flex sm:items-center">
      <label htmlFor="home-question" className="sr-only">{questionLabel}</label>
      <div ref={wrapRef} className="relative flex flex-1 items-center sm:min-w-0">
        <input
          id="home-question"
          name="q"
          type="text"
          placeholder={currentPlaceholder}
          className={`min-h-12 w-full rounded-xl border-0 bg-transparent pl-4 pr-16 text-base text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${fadeClass}`}
        />
        <div className="absolute right-2 flex items-center">
          <button
            type="button"
            onClick={() => setVoiceOpen((v) => !v)}
            aria-expanded={voiceOpen}
            aria-haspopup="dialog"
            aria-label={voiceButtonLabel}
            title={voiceButtonLabel}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-sm ring-1 ring-[var(--brand-dark)] transition-all duration-200 hover:bg-[var(--brand-dark)] hover:shadow-md active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2"
          >
            <span aria-hidden="true" className="text-xl leading-none">🎙</span>
          </button>
          {voiceOpen && (
            <div
              ref={voicePopoverRef}
              role="status"
              aria-live="polite"
              className="absolute right-0 top-full z-20 mt-2 w-72 rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-lg sm:right-2 sm:w-80"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-lg leading-none text-sky-700">🎙</span>
                  <div>
                    <p className="text-sm font-semibold text-sky-950">{voiceTitle}</p>
                    <p className="mt-1 text-xs leading-5 text-sky-900">{voiceBody}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceOpen(false)}
                  aria-label={voiceDismissLabel}
                  className="shrink-0 inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg text-sky-700 transition-colors hover:bg-sky-100"
                >
                  <span aria-hidden="true" className="text-lg leading-none">×</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        type="submit"
        className="mt-2 min-h-12 w-full rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-dark)] sm:mt-0 sm:w-auto sm:shrink-0"
      >
        {continueLabel}
      </button>
    </form>
  );
}

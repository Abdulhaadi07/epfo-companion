import { describe, expect, it } from "vitest";
import { SUPPORTED_LOCALES } from "./locales";
import { getLocaleLabel, getLocaleOptions, LOCALE_LABELS } from "./locale-labels";

describe("locale labels", () => {
  it("exposes all six supported locales with native-language names", () => {
    const options = getLocaleOptions();

    expect(options).toHaveLength(6);
    expect(options.map((option) => option.value)).toEqual([...SUPPORTED_LOCALES]);
    expect(options).toEqual([
      { value: "en", label: "English" },
      { value: "hi", label: "हिन्दी" },
      { value: "te", label: "తెలుగు" },
      { value: "ta", label: "தமிழ்" },
      { value: "bn", label: "বাংলা" },
      { value: "mr", label: "मराठी" },
    ]);
  });

  it("returns the label for the current locale", () => {
    expect(getLocaleLabel("hi")).toBe(LOCALE_LABELS.hi);
    expect(getLocaleLabel("te")).toBe("తెలుగు");
  });
});

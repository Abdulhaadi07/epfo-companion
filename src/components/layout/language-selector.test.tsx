import { describe, expect, it } from "vitest";
import { getLocaleOptions } from "@/i18n/locale-labels";
import { LanguageSelectorCore } from "@/components/layout/language-selector";
import { renderToStaticMarkup } from "react-dom/server";

describe("LanguageSelectorCore", () => {
  it("renders all six supported locales in a native select control", () => {
    const html = renderToStaticMarkup(
      <LanguageSelectorCore currentLocale="en" returnPath="/help" returnSearch="error=auth" languageLabel="Language" />,
    );

    for (const option of getLocaleOptions()) {
      expect(html).toContain(`value="${option.value}"`);
      expect(html).toContain(option.label);
    }
  });

  it("marks the current locale as selected and exposes accessible semantics", () => {
    const html = renderToStaticMarkup(
      <LanguageSelectorCore currentLocale="hi" returnPath="/home" returnSearch="" languageLabel="भाषा" />,
    );

    expect(html).toContain('id="language-selector"');
    expect(html).toContain('name="locale"');
    expect(html).toContain('aria-label="भाषा"');
    expect(html).toContain('for="language-selector"');
    expect(html).toContain('value="hi" selected');
    expect(html).toContain('name="returnPath" value="/home"');
    expect(html).toContain('name="returnSearch" value=""');
    expect(html).toContain('title="भाषा: हिन्दी"');
  });
});

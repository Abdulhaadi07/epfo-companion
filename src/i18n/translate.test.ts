import { describe, expect, it } from "vitest";
import { hiDictionary } from "./dictionaries/hi";
import { enDictionary } from "./dictionaries/en";
import { SUPPORTED_LOCALES } from "./locales";
import {
  assertDictionaryCoverage,
  assertNoExtraDictionaryKeys,
  getDictionary,
  getTranslationKeys,
  resolveDictionaryLocale,
  translate,
  type TranslationKey,
} from "./translate";

describe("static translations", () => {
  const translationKeys = getTranslationKeys();

  it("derives stable translation keys from the English dictionary", () => {
    expect(translationKeys).toContain("nav.home");
    expect(translationKeys).toContain("account.balance");
    expect(translationKeys).toContain("claim.status.ready");
    expect(translationKeys).toContain("help.title");
    expect(new Set(translationKeys).size).toBe(translationKeys.length);
  });

  it("keeps English and Hindi dictionaries in sync", () => {
    assertDictionaryCoverage(hiDictionary, translationKeys);
    assertNoExtraDictionaryKeys(hiDictionary, translationKeys);
    expect(Object.keys(hiDictionary).sort()).toEqual(Object.keys(enDictionary).sort());
  });

  it("looks up English dictionary entries", () => {
    expect(translate("en", "nav.home")).toBe("Home");
    expect(translate("en", "account.readiness")).toBe("Readiness checks");
    expect(translate("en", "claim.action.viewStatus")).toBe("View claim status");
    expect(translate("en", "help.description")).toMatch(/prototype guidance paths/);
  });

  it("looks up Hindi dictionary entries", () => {
    expect(translate("hi", "nav.home")).toBe("होम");
    expect(translate("hi", "account.readiness")).toBe("तैयारी जाँच");
    expect(translate("hi", "claim.action.completeKyc")).toBe("KYC पूरा करें");
    expect(translate("hi", "help.title")).toBe("कुछ ठीक नहीं लग रहा?");
  });

  it.each(["te", "ta", "bn", "mr"] as const)("falls back to English for unsupported locale %s", (locale) => {
    expect(resolveDictionaryLocale(locale)).toBe("en");
    expect(getDictionary(locale)).toBe(enDictionary);
    expect(translate(locale, "nav.myClaims")).toBe("My Claims");
  });

  it("resolves Hindi for the hi locale", () => {
    expect(resolveDictionaryLocale("hi")).toBe("hi");
    expect(getDictionary("hi")).toBe(hiDictionary);
  });

  it("covers representative navigation, account, claim, and help keys in both locales", () => {
    const representativeKeys = [
      "nav.home",
      "nav.myClaims",
      "nav.help",
      "nav.services",
      "nav.language",
      "account.title",
      "account.balance",
      "account.employment",
      "account.readiness",
      "account.identity",
      "account.bankDetails",
      "account.kyc",
      "claim.title",
      "claim.status.ready",
      "claim.status.underVerification",
      "claim.status.actionRequired",
      "claim.status.rejected",
      "claim.reason.bankAccountMismatch",
      "claim.reason.kycIncomplete",
      "claim.action.start",
      "claim.action.updateBankDetails",
      "claim.action.completeKyc",
      "claim.action.viewStatus",
      "help.title",
      "help.description",
    ] satisfies readonly TranslationKey[];

    for (const key of representativeKeys) {
      expect(translate("en", key).length).toBeGreaterThan(0);
      expect(translate("hi", key).length).toBeGreaterThan(0);
    }

    expect(translate("en", "nav.home")).not.toBe(translate("hi", "nav.home"));
    expect(translate("en", "help.description")).not.toBe(translate("hi", "help.description"));
  });

  it("throws when dictionary coverage assertions detect missing keys", () => {
    const incompleteDictionary = { ...enDictionary };
    delete incompleteDictionary["nav.home"];

    expect(() => assertDictionaryCoverage(incompleteDictionary, ["nav.home"])).toThrow(
      "Dictionary is missing keys: nav.home",
    );
  });

  it("throws when dictionary coverage assertions detect unexpected keys", () => {
    expect(() => assertNoExtraDictionaryKeys({ ...enDictionary, "nav.unknown": "Unknown" })).toThrow(
      "Dictionary has unexpected keys: nav.unknown",
    );
  });

  it("returns English copy for valid keys without throwing", () => {
    expect(translate("en", "nav.home")).toBe("Home");
  });

  it("declares all supported locales without requiring dictionaries yet", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "hi", "te", "ta", "bn", "mr"]);
  });
});

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCitizenHomeView } from "@/application/citizen-home";
import { getMyClaimsView } from "@/application/my-claims";
import { createTranslator } from "@/i18n/server";
import { getShellLabels } from "@/i18n/shell-labels";
import { localizeCitizenHomeView, localizeMyClaimsView } from "@/i18n/localize-views";
import { translate, resolveDictionaryLocale } from "@/i18n/translate";
import { SUPPORTED_LOCALES } from "@/i18n/locales";
import { buildClaimPresentation } from "@/lib/claim-presentation";
import type { ClaimRecord, UserRecord } from "@/repositories";

const user: UserRecord = {
  id: "synthetic-user-ready",
  uan: "100000000001",
  passwordHash: "hashed",
  displayName: "Aarav Mehta",
  identityStatus: "READY",
  preferredLanguage: "en",
  preferredRegion: "Maharashtra",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

function claim(partial: Partial<ClaimRecord> & Pick<ClaimRecord, "id" | "currentStatus" | "updatedAt">): ClaimRecord {
  return {
    userId: user.id,
    pfAccountId: `pf-${partial.id}`,
    claimType: "FINAL_SETTLEMENT",
    reasonCodes: [],
    amountInPaise: 1_250_000,
    createdAt: partial.updatedAt,
    ...partial,
  };
}

describe("shell localization", () => {
  it("renders English shell labels for unauthenticated users", () => {
    const { t } = createTranslator("en");
    const labels = getShellLabels(t, false);
    const html = renderToStaticMarkup(
      <SiteHeader isAuthenticated={false} currentLocale="en" labels={labels} />,
    );

    expect(html).toContain("Home");
    expect(html).toContain("Services");
    expect(html).toContain("Sign in");
    expect(html).toContain("EPFO Companion");
  });

  it("renders Hindi shell labels for authenticated users", () => {
    const { t } = createTranslator("hi");
    const labels = getShellLabels(t, true);
    const html = renderToStaticMarkup(
      <SiteHeader isAuthenticated displayName="Aarav Mehta" currentLocale="hi" labels={labels} />,
    );

    expect(html).toContain("होम");
    expect(html).toContain("मेरे दावे");
    expect(html).toContain("साइन आउट");
    expect(html).toContain("Aarav Mehta");
  });

  it("renders localized footer disclosure", () => {
    const { t } = createTranslator("hi");
    const labels = getShellLabels(t, false);
    const html = renderToStaticMarkup(
      <SiteFooter
        labels={{
          brandName: labels.brandName,
          footerDescription: labels.footerDescription,
          prototypeDisclosure: labels.prototypeDisclosure,
          navFooter: labels.navFooter,
          helpLabel: t("nav.help"),
          aboutLabel: t("nav.about"),
        }}
      />,
    );

    expect(html).toContain("सहायता");
    expect(html).toContain("स्वतंत्र प्रोटोटाइप");
  });
});

describe("page localization", () => {
  it("localizes representative home copy in Hindi", async () => {
    const view = await getCitizenHomeView(user.id, {
      findUserById: async () => user,
      listEmploymentByUserId: async () => [{
        id: "employment-1",
        userId: user.id,
        employerName: "Hindustan Textiles Pvt Ltd",
        startDate: "2020-04-01",
        endDate: "2025-12-31",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      }],
      listPfAccountsByUserId: async () => [{
        id: "pf-1",
        userId: user.id,
        employmentId: "employment-1",
        syntheticMemberId: "SYN-1",
        balanceInPaise: 12_500_000,
        bankDisplayName: "State Bank of India",
        bankStatus: "READY",
        kycStatus: "READY",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      }],
      listClaimsByUserId: async () => [],
      listClaimEventsByClaimId: async () => [],
    });

    expect(view).not.toBeNull();
    const localized = localizeCitizenHomeView(createTranslator("hi").t, view!);

    expect(localized.taskHeadline).toBe("अपनी PF निकासी शुरू करें");
    expect(localized.citizenSummaryLabels.accountTitle).toBe("आपका PF खाता");
    expect(localized.greeting.displayName).toBe("Aarav Mehta");
    expect(localized.accountSummary.balanceDisplay).toContain("₹");
  });

  it("localizes representative My Claims copy in English", async () => {
    const readyClaim = claim({ id: "claim-ready", currentStatus: "READY", updatedAt: new Date("2026-01-02") });
    const view = await getMyClaimsView(user.id, {
      findUserById: async () => user,
      listClaimsByUserId: async () => [readyClaim],
    });

    const localized = localizeMyClaimsView(createTranslator("en").t, view!);

    expect(localized.pageLabels.title).toBe("My claims");
    expect(localized.claims[0]?.presentation.label).toBe("Ready to submit");
    expect(localized.claims[0]?.updatedDisplay).toMatch(/2026/);
  });

  it("falls back to English dictionary for te/ta/bn/mr locales", () => {
    for (const locale of ["te", "ta", "bn", "mr"] as const) {
      expect(resolveDictionaryLocale(locale)).toBe("en");
      expect(translate(locale, "nav.home")).toBe("Home");
      expect(translate(locale, "claims.title")).toBe("My claims");
    }
  });

  it("propagates Hindi locale to translated home task headlines", () => {
    const { t: tEn } = createTranslator("en");
    const { t: tHi } = createTranslator("hi");

    expect(tEn("home.taskHeadlineReady")).toBe("Your PF withdrawal is ready to submit");
    expect(tHi("home.taskHeadlineReady")).toBe("आपकी PF निकासी जमा करने के लिए तैयार है");
  });

  it("keeps login labels available in Hindi without translating dynamic sample data", () => {
    const { t } = createTranslator("hi");

    expect(t("auth.welcomeBack")).toBe("वापसी पर स्वागत है");
    expect(t("auth.uanLabel")).toContain("UAN");
    expect(t("auth.authError")).toBe("लॉगिन विवरण सत्यापित नहीं हो सके।");
  });
});

describe("claim presentation semantics", () => {
  it("keeps claim status values language-neutral in presentation models", () => {
    const model = buildClaimPresentation({
      status: "ACTION_REQUIRED",
      reasonCodes: ["BANK_NAME_MISMATCH"],
    });

    expect(model.labelKey).toBe("claim.status.actionRequired");
    expect(model.situationKey).toBe("claim.presentation.situation.actionRequired.bankAccountMismatch");
    expect(model.actionLabelKey).toBe("claim.action.updateBankDetails");
    expect(model.labelKey).not.toContain(" ");
  });

  it("does not route dynamic values through translation lookup", () => {
    const model = buildClaimPresentation({ status: "READY", reasonCodes: [] });

    expect(model.actionHref).toBe("/claim/start");
    expect(SUPPORTED_LOCALES.every((locale) => translate(locale, model.labelKey) !== "READY")).toBe(true);
  });
});

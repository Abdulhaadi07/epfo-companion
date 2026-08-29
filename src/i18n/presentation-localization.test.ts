import { describe, expect, it } from "vitest";
import { CLAIM_REASON_CODES } from "@/domain/claims";
import { assembleReadiness } from "@/application/readiness";
import { getCitizenHomeView } from "@/application/citizen-home";
import { getMyClaimsView } from "@/application/my-claims";
import { buildTimelinePreview } from "@/application/timeline";
import { toClaimEntity } from "@/application/claim-mapper";
import type { ClaimEventRecord, ClaimRecord, EmploymentRecord, PFAccountRecord, UserRecord } from "@/repositories";
import { createTranslator } from "@/i18n/server";
import { translate } from "@/i18n/translate";
import { localizeCitizenHomeView, localizeMyClaimsView } from "@/i18n/localize-views";
import {
  buildClaimPresentation,
  localizeClaimPresentation,
  localizeReasonSummaries,
} from "@/lib/claim-presentation";
import {
  CLAIM_REASON_SITUATION_OVERRIDE_KEYS,
  CLAIM_REASON_SUMMARY_KEYS,
} from "@/lib/claim-presentation-keys";

const tEn = (key: Parameters<typeof translate>[1]) => translate("en", key);
const tHi = (key: Parameters<typeof translate>[1]) => translate("hi", key);

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

describe("claim presentation localization", () => {
  it.each([
    ["READY", "Ready to submit", "जमा करने के लिए तैयार", "Start my claim", "मेरा दावा शुरू करें"],
    ["UNDER_VERIFICATION", "Under verification", "सत्यापन के अधीन", "View claim status", "दावे की स्थिति देखें"],
    ["ACTION_REQUIRED", "Something needs your attention", "आपके ध्यान की आवश्यकता है", "Fix this problem", "इस समस्या को ठीक करें"],
    ["REJECTED", "Your claim couldn't continue", "आपका दावा आगे नहीं बढ़ सका", "Understand the problem", "समस्या समझें"],
  ] as const)("localizes %s status labels and default actions", (status, enLabel, hiLabel, enAction, hiAction) => {
    const model = buildClaimPresentation({ status, reasonCodes: [] });
    const en = localizeClaimPresentation(tEn, model);
    const hi = localizeClaimPresentation(tHi, model);

    expect(en.label).toBe(enLabel);
    expect(hi.label).toBe(hiLabel);
    expect(en.actionLabel).toBe(enAction);
    expect(hi.actionLabel).toBe(hiAction);
    expect(model.severity).toBe(en.severity);
    expect(model.actionHref).toBe(en.actionHref);
    expect(model.actionRequired).toBe(en.actionRequired);
  });

  it.each(CLAIM_REASON_CODES)("maps %s to a reason summary key with English and Hindi copy", (reasonCode) => {
    const key = CLAIM_REASON_SUMMARY_KEYS[reasonCode];
    const enSummary = localizeReasonSummaries(tEn, [key])[0];
    const hiSummary = localizeReasonSummaries(tHi, [key])[0];

    expect(enSummary).toBeTruthy();
    expect(hiSummary).toBeTruthy();
    expect(enSummary).not.toBe(hiSummary);
    expect(enSummary).not.toContain(reasonCode);
    expect(hiSummary).not.toContain(reasonCode);
  });

  it.each(
    Object.entries(CLAIM_REASON_SITUATION_OVERRIDE_KEYS.ACTION_REQUIRED ?? {}) as [string, string][],
  )("localizes ACTION_REQUIRED situation override for %s", (reasonCode, situationKey) => {
    const model = buildClaimPresentation({
      status: "ACTION_REQUIRED",
      reasonCodes: [reasonCode as (typeof CLAIM_REASON_CODES)[number]],
    });

    expect(model.situationKey).toBe(situationKey);
    expect(localizeClaimPresentation(tEn, model).situation).not.toBe(
      localizeClaimPresentation(tHi, model).situation,
    );
  });

  it("keeps BANK_NAME_MISMATCH and KYC_INCOMPLETE behavior in Hindi", () => {
    const bankModel = buildClaimPresentation({
      status: "ACTION_REQUIRED",
      reasonCodes: ["BANK_NAME_MISMATCH"],
      allowedActions: ["UPDATE_BANK_DETAILS"],
    });
    const kycModel = buildClaimPresentation({
      status: "REJECTED",
      reasonCodes: ["KYC_INCOMPLETE"],
      allowedActions: ["COMPLETE_KYC"],
    });

    expect(localizeClaimPresentation(tHi, bankModel).actionLabel).toBe("बैंक विवरण अपडेट करें");
    expect(localizeClaimPresentation(tHi, kycModel).actionLabel).toBe("KYC पूरा करें");
    expect(localizeReasonSummaries(tHi, ["claim.reason.bankAccountMismatch"])[0]).toContain("बैंक");
    expect(localizeReasonSummaries(tHi, ["claim.reason.kycIncomplete"])[0]).toContain("KYC");
  });
});

describe("readiness presentation localization", () => {
  it("localizes readiness labels in English and Hindi", () => {
    const readiness = assembleReadiness({
      identityStatus: "READY",
      bankStatus: "ACTION_REQUIRED",
      kycStatus: "UNDER_VERIFICATION",
    });
    const { t: en } = createTranslator("en");
    const { t: hi } = createTranslator("hi");
    const localizedEn = localizeCitizenHomeView(en, {
      greeting: { displayName: user.displayName },
      activeClaim: null,
      accountSummary: { balanceDisplay: "₹1,25,000.00" },
      employmentSummary: { employerName: "Hindustan Textiles Pvt Ltd", periodDisplay: "Apr 2020 – Dec 2025" },
      readiness,
      helpPrompt: {
        titleKey: "home.helpPromptTitle",
        descriptionKey: "home.helpPromptDescription",
        href: "/help#claim-stuck",
        linkLabelKey: "home.helpPromptLink",
      },
    });
    const localizedHi = localizeCitizenHomeView(hi, {
      greeting: { displayName: user.displayName },
      activeClaim: null,
      accountSummary: { balanceDisplay: "₹1,25,000.00" },
      employmentSummary: { employerName: "Hindustan Textiles Pvt Ltd", periodDisplay: "Apr 2020 – Dec 2025" },
      readiness,
      helpPrompt: {
        titleKey: "home.helpPromptTitle",
        descriptionKey: "home.helpPromptDescription",
        href: "/help#claim-stuck",
        linkLabelKey: "home.helpPromptLink",
      },
    });

    expect(localizedEn.readiness.overallLabel).toBe("One or more details need attention");
    expect(localizedHi.readiness.overallLabel).toBe("एक या अधिक विवरणों पर ध्यान देने की आवश्यकता है");
    expect(localizedEn.readiness.dimensions.find((d) => d.key === "bank")?.displayLabel).toBe(
      "Bank details need attention",
    );
    expect(localizedHi.readiness.dimensions.find((d) => d.key === "bank")?.displayLabel).toBe(
      "बैंक विवरण पर ध्यान देने की आवश्यकता है",
    );
    expect(localizedEn.readiness.dimensions.every((d) => ["READY", "UNDER_VERIFICATION", "ACTION_REQUIRED", "REJECTED"].includes(d.status))).toBe(true);
  });
});

describe("locale switching preserves language-neutral facts", () => {
  it("changes only presentation strings between English and Hindi home views", async () => {
    const employment: EmploymentRecord = {
      id: "employment-1",
      userId: user.id,
      employerName: "Hindustan Textiles Pvt Ltd",
      startDate: "2020-04-01",
      endDate: "2025-12-31",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    };
    const pfAccount: PFAccountRecord = {
      id: "pf-1",
      userId: user.id,
      employmentId: employment.id,
      syntheticMemberId: "SYN-1",
      balanceInPaise: 12_500_000,
      bankDisplayName: "State Bank of India",
      bankStatus: "READY",
      kycStatus: "READY",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    };
    const activeClaim = claim({
      id: "claim-ready",
      pfAccountId: "pf-1",
      currentStatus: "READY",
      updatedAt: new Date("2026-01-02"),
    });
    const events: ClaimEventRecord[] = [
      {
        id: "evt-1",
        claimId: activeClaim.id,
        eventType: "CLAIM_MARKED_READY",
        reasonCode: null,
        occurredAt: new Date("2026-01-02"),
        metadata: null,
      },
    ];
    const deps = {
      findUserById: async () => user,
      listEmploymentByUserId: async () => [employment],
      listPfAccountsByUserId: async () => [pfAccount],
      listClaimsByUserId: async () => [activeClaim],
      listClaimEventsByClaimId: async () => events,
    };

    const view = await getCitizenHomeView(user.id, deps);
    expect(view).not.toBeNull();

    const en = localizeCitizenHomeView(createTranslator("en").t, view!);
    const hi = localizeCitizenHomeView(createTranslator("hi").t, view!);

    expect(en.activeClaim?.status).toBe("READY");
    expect(hi.activeClaim?.status).toBe("READY");
    expect(en.greeting.displayName).toBe("Aarav Mehta");
    expect(hi.greeting.displayName).toBe("Aarav Mehta");
    expect(en.accountSummary.balanceDisplay).toBe(hi.accountSummary.balanceDisplay);
    expect(en.employmentSummary.employerName).toBe(hi.employmentSummary.employerName);
    expect(en.activeClaim?.presentation.label).not.toBe(hi.activeClaim?.presentation.label);
    expect(en.taskHeadline).not.toBe(hi.taskHeadline);
  });

  it("falls back to English dictionary for unsupported locales", () => {
    const model = buildClaimPresentation({ status: "READY", reasonCodes: [] });

    expect(translate("te", model.labelKey)).toBe(localizeClaimPresentation(tEn, model).label);
    expect(translate("mr", model.labelKey)).toBe(localizeClaimPresentation(tEn, model).label);
  });

  it("localizes my claims list copy while preserving ids, dates, and status enums", async () => {
    const readyClaim = claim({ id: "claim-ready", currentStatus: "READY", updatedAt: new Date("2026-01-02") });
    const view = await getMyClaimsView(user.id, {
      findUserById: async () => user,
      listClaimsByUserId: async () => [readyClaim],
    });
    const en = localizeMyClaimsView(createTranslator("en").t, view!);
    const hi = localizeMyClaimsView(createTranslator("hi").t, view!);

    expect(en.claims[0]?.id).toBe(hi.claims[0]?.id);
    expect(en.claims[0]?.status).toBe("READY");
    expect(en.claims[0]?.updatedDisplay).toBe(hi.claims[0]?.updatedDisplay);
    expect(en.claims[0]?.presentation.label).toBe("Ready to submit");
    expect(hi.claims[0]?.presentation.label).toBe("जमा करने के लिए तैयार");
  });

  it("keeps timeline preview ids and dates stable across locales", async () => {
    const activeClaim = claim({
      id: "claim-action",
      currentStatus: "ACTION_REQUIRED",
      reasonCodes: ["BANK_NAME_MISMATCH"],
      updatedAt: new Date("2026-01-05"),
    });
    const events: ClaimEventRecord[] = [
      {
        id: "evt-1",
        claimId: activeClaim.id,
        eventType: "CLAIM_MARKED_READY",
        reasonCode: null,
        occurredAt: new Date("2026-01-02"),
        metadata: null,
      },
      {
        id: "evt-2",
        claimId: activeClaim.id,
        eventType: "ACTION_REQUIRED",
        reasonCode: "BANK_NAME_MISMATCH",
        occurredAt: new Date("2026-01-05"),
        metadata: null,
      },
    ];
    const entity = toClaimEntity(activeClaim, events);
    const preview = buildTimelinePreview(entity.timeline);
    const en = localizeCitizenHomeView(createTranslator("en").t, {
      greeting: { displayName: user.displayName },
      activeClaim: {
        id: entity.id,
        status: entity.status,
        allowedActions: ["UPDATE_BANK_DETAILS"],
        reasonSummaryKeys: ["claim.reason.bankAccountMismatch"],
        presentation: buildClaimPresentation({
          status: entity.status,
          reasonCodes: entity.reasonCodes,
          allowedActions: ["UPDATE_BANK_DETAILS"],
        }),
        timelinePreview: preview,
      },
      accountSummary: { balanceDisplay: "₹1,25,000.00" },
      employmentSummary: { employerName: "Hindustan Textiles Pvt Ltd", periodDisplay: "Apr 2020 – Dec 2025" },
      readiness: assembleReadiness({ identityStatus: "READY", bankStatus: "READY", kycStatus: "READY" }),
      helpPrompt: {
        titleKey: "home.helpPromptTitle",
        descriptionKey: "home.helpPromptDescription",
        href: "/help#claim-stuck",
        linkLabelKey: "home.helpPromptLink",
      },
    });
    const hi = localizeCitizenHomeView(createTranslator("hi").t, {
      greeting: { displayName: user.displayName },
      activeClaim: {
        id: entity.id,
        status: entity.status,
        allowedActions: ["UPDATE_BANK_DETAILS"],
        reasonSummaryKeys: ["claim.reason.bankAccountMismatch"],
        presentation: buildClaimPresentation({
          status: entity.status,
          reasonCodes: entity.reasonCodes,
          allowedActions: ["UPDATE_BANK_DETAILS"],
        }),
        timelinePreview: preview,
      },
      accountSummary: { balanceDisplay: "₹1,25,000.00" },
      employmentSummary: { employerName: "Hindustan Textiles Pvt Ltd", periodDisplay: "Apr 2020 – Dec 2025" },
      readiness: assembleReadiness({ identityStatus: "READY", bankStatus: "READY", kycStatus: "READY" }),
      helpPrompt: {
        titleKey: "home.helpPromptTitle",
        descriptionKey: "home.helpPromptDescription",
        href: "/help#claim-stuck",
        linkLabelKey: "home.helpPromptLink",
      },
    });

    expect(en.activeClaim?.timelinePreview[0]?.id).toBe(hi.activeClaim?.timelinePreview[0]?.id);
    expect(en.activeClaim?.timelinePreview[0]?.occurredAtDisplay).toBe(
      hi.activeClaim?.timelinePreview[0]?.occurredAtDisplay,
    );
    expect(en.activeClaim?.timelinePreview[0]?.label).not.toBe(hi.activeClaim?.timelinePreview[0]?.label);
  });
});

import { describe, expect, it } from "vitest";
import { CLAIM_STATUSES } from "../domain/claims";
import {
  buildClaimPresentation,
  getClaimPresentation,
  getReasonSummaries,
  getReasonSummaryKeys,
  localizeClaimPresentation,
} from "./claim-presentation";
import { translate } from "@/i18n/translate";

const tEn = (key: Parameters<typeof translate>[1]) => translate("en", key);

describe("claim presentation mapping", () => {
  it.each(CLAIM_STATUSES)("maps %s to citizen language", (status) => {
    const presentation = getClaimPresentation(status);
    expect(presentation.label).not.toBe(status);
    expect(presentation.situation).not.toContain(status);
    expect(presentation.actionLabel).toBeTruthy();
    expect(presentation.actionHref).toBeTruthy();
  });

  it("explains that under verification needs no action", () => {
    expect(getClaimPresentation("UNDER_VERIFICATION")).toMatchObject({
      label: "Under verification",
      actionRequired: false,
      actionMessage: "No — you do not need to do anything right now.",
      actionLabel: "View claim status",
      actionHref: "/claim/status",
    });
  });

  it("maps attention states to resolution-oriented actions", () => {
    expect(getClaimPresentation("ACTION_REQUIRED")).toMatchObject({ actionRequired: true, actionLabel: "Fix this problem", actionHref: "/claim/status" });
    expect(getClaimPresentation("REJECTED")).toMatchObject({ actionRequired: true, actionLabel: "Understand the problem", actionHref: "/claim/status" });
  });

  it("maps ready claims to the start of the future journey", () => {
    expect(getClaimPresentation("READY")).toMatchObject({ label: "Ready to submit", actionLabel: "Start my claim", actionHref: "/claim/start" });
  });
});

describe("buildClaimPresentation", () => {
  it("uses bank mismatch specific messaging for action required claims", () => {
    const model = buildClaimPresentation({
      status: "ACTION_REQUIRED",
      reasonCodes: ["BANK_NAME_MISMATCH"],
    });
    const presentation = localizeClaimPresentation(tEn, model);

    expect(model.situationKey).toBe("claim.presentation.situation.actionRequired.bankAccountMismatch");
    expect(presentation.situation).toContain("bank account name does not match");
    expect(presentation.actionLabel).toBe("Update bank details");
    expect(getReasonSummaryKeys(["BANK_NAME_MISMATCH"])).toEqual([
      "claim.reason.bankAccountMismatch",
    ]);
    expect(getReasonSummaries(["BANK_NAME_MISMATCH"])).toEqual([
      "The bank account name does not match your PF records.",
    ]);
  });

  it("uses KYC specific messaging for rejected claims", () => {
    const model = buildClaimPresentation({
      status: "REJECTED",
      reasonCodes: ["KYC_INCOMPLETE"],
    });
    const presentation = localizeClaimPresentation(tEn, model);

    expect(model.situationKey).toBe("claim.presentation.situation.rejected.kycIncomplete");
    expect(presentation.situation).toContain("KYC details are incomplete");
    expect(presentation.actionLabel).toBe("Complete KYC");
    expect(getReasonSummaries(["KYC_INCOMPLETE"])).toEqual([
      "Your KYC details are incomplete.",
    ]);
  });

  it("respects allowed actions when choosing the primary CTA", () => {
    const model = buildClaimPresentation({
      status: "ACTION_REQUIRED",
      reasonCodes: ["BANK_NAME_MISMATCH"],
      allowedActions: ["UPDATE_BANK_DETAILS"],
    });
    const presentation = localizeClaimPresentation(tEn, model);

    expect(model.actionLabelKey).toBe("claim.action.updateBankDetails");
    expect(presentation.actionLabel).toBe("Update bank details");
    expect(presentation.actionHref).toBe("/claim/status");
  });
});

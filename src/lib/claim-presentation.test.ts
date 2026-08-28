import { describe, expect, it } from "vitest";
import { CLAIM_STATUSES } from "../domain/claims";
import { getClaimPresentation } from "./claim-presentation";

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
      actionMessage: "No, you do not need to do anything right now.",
      actionLabel: "View my claim",
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

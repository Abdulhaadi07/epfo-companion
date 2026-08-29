import { describe, expect, it } from "vitest";
import type { ClaimTimelineEvent } from "@/domain/claims";
import { buildTimelinePreview } from "./timeline";
import { createTranslator } from "@/i18n/server";

function event(
  partial: Partial<ClaimTimelineEvent> & Pick<ClaimTimelineEvent, "type" | "id" | "occurredAt">,
): ClaimTimelineEvent {
  return partial as ClaimTimelineEvent;
}

describe("buildTimelinePreview", () => {
  it("maps domain events to semantic label keys", () => {
    const timeline: ClaimTimelineEvent[] = [
      event({ id: "e1", type: "CLAIM_MARKED_READY", occurredAt: "2026-01-02T10:00:00.000Z" }),
      event({ id: "e2", type: "CLAIM_SUBMITTED", occurredAt: "2026-01-03T10:00:00.000Z" }),
      event({
        id: "e3",
        type: "ACTION_REQUIRED",
        reasonCode: "BANK_NAME_MISMATCH",
        occurredAt: "2026-01-04T10:00:00.000Z",
      }),
    ];

    const preview = buildTimelinePreview(timeline);

    expect(preview).toHaveLength(3);
    expect(preview[0]?.labelKey).toBe("timeline.event.claimMarkedReady");
    expect(preview[1]?.labelKey).toBe("timeline.event.claimSubmitted");
    expect(preview[2]?.labelKey).toBe("timeline.reason.bankAccountMismatch");
    expect(preview[2]?.occurredAtDisplay).toMatch(/2026/);
  });

  it("uses reason-specific keys for rejected events when available", () => {
    const preview = buildTimelinePreview([
      event({
        id: "e1",
        type: "CLAIM_REJECTED",
        reasonCode: "KYC_INCOMPLETE",
        occurredAt: "2026-01-05T10:00:00.000Z",
      }),
    ]);

    expect(preview[0]?.labelKey).toBe("timeline.reason.kycIncomplete");
  });

  it("localizes timeline labels without changing event ids or dates", () => {
    const timeline: ClaimTimelineEvent[] = [
      event({ id: "evt-42", type: "VERIFICATION_STARTED", occurredAt: "2026-01-04T10:00:00.000Z" }),
    ];
    const preview = buildTimelinePreview(timeline);
    const { t: tEn } = createTranslator("en");
    const { t: tHi } = createTranslator("hi");

    const enLabel = tEn(preview[0]!.labelKey);
    const hiLabel = tHi(preview[0]!.labelKey);

    expect(enLabel).toBe("Verification started");
    expect(hiLabel).toBe("सत्यापन शुरू");
    expect(preview[0]?.id).toBe("evt-42");
    expect(preview[0]?.occurredAtDisplay).toBe(preview[0]?.occurredAtDisplay);
  });
});

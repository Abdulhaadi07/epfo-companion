import { describe, expect, it } from "vitest";
import { assembleReadiness } from "./readiness";

describe("assembleReadiness", () => {
  it("reports ready when all dimensions are ready", () => {
    expect(assembleReadiness({
      identityStatus: "READY",
      bankStatus: "READY",
      kycStatus: "READY",
    })).toMatchObject({
      overallLabelKey: "readiness.readyToProceed",
      actionRequired: false,
    });
  });

  it("derives readiness from persisted dimension statuses rather than claim status", () => {
    const readiness = assembleReadiness({
      identityStatus: "READY",
      bankStatus: "ACTION_REQUIRED",
      kycStatus: "READY",
    });

    expect(readiness.overallLabelKey).toBe("readiness.detailsNeedAttention");
    expect(readiness.actionRequired).toBe(true);
    expect(readiness.dimensions.find((dimension) => dimension.key === "bank")).toMatchObject({
      citizenMessageKey: "readiness.needsAttention",
      displayLabelKey: "readiness.bankNeedsAttention",
    });
  });

  it("flags rejected dimensions", () => {
    const readiness = assembleReadiness({
      identityStatus: "READY",
      bankStatus: "READY",
      kycStatus: "REJECTED",
    });

    expect(readiness.overallLabelKey).toBe("readiness.checksCouldNotBeCompleted");
    expect(readiness.actionRequired).toBe(true);
  });
});

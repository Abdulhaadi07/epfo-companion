import { describe, expect, it } from "vitest";
import { selectActiveClaim, sortClaimsForList } from "./claim-selection";
import type { ClaimRecord } from "@/repositories";

function claim(partial: Partial<ClaimRecord> & Pick<ClaimRecord, "id" | "currentStatus" | "updatedAt">): ClaimRecord {
  return {
    userId: "user-1",
    pfAccountId: `pf-${partial.id}`,
    claimType: "FINAL_SETTLEMENT",
    reasonCodes: [],
    amountInPaise: 100,
    createdAt: partial.updatedAt,
    ...partial,
  };
}

describe("selectActiveClaim", () => {
  it("returns null when there are no claims", () => {
    expect(selectActiveClaim([])).toBeNull();
  });

  it("returns the only claim when one exists", () => {
    const only = claim({ id: "claim-1", currentStatus: "READY", updatedAt: new Date("2026-01-01") });
    expect(selectActiveClaim([only])).toEqual(only);
  });

  it("prefers in-progress claims over settled claims", () => {
    const settled = claim({ id: "claim-settled", currentStatus: "SETTLED", updatedAt: new Date("2026-02-01") });
    const active = claim({ id: "claim-active", currentStatus: "UNDER_VERIFICATION", updatedAt: new Date("2026-01-01") });
    expect(selectActiveClaim([settled, active])?.id).toBe("claim-active");
  });

  it("chooses the most recently updated in-progress claim", () => {
    const older = claim({ id: "claim-old", currentStatus: "ACTION_REQUIRED", updatedAt: new Date("2026-01-01") });
    const newer = claim({ id: "claim-new", currentStatus: "UNDER_VERIFICATION", updatedAt: new Date("2026-02-01") });
    expect(selectActiveClaim([older, newer])?.id).toBe("claim-new");
  });

  it("breaks ties by claim id ascending", () => {
    const left = claim({ id: "claim-a", currentStatus: "READY", updatedAt: new Date("2026-01-01") });
    const right = claim({ id: "claim-b", currentStatus: "READY", updatedAt: new Date("2026-01-01") });
    expect(selectActiveClaim([right, left])?.id).toBe("claim-a");
  });
});

describe("sortClaimsForList", () => {
  it("places non-settled claims before settled claims", () => {
    const settled = claim({ id: "claim-settled", currentStatus: "SETTLED", updatedAt: new Date("2026-03-01") });
    const active = claim({ id: "claim-active", currentStatus: "UNDER_VERIFICATION", updatedAt: new Date("2026-01-01") });
    expect(sortClaimsForList([settled, active]).map((item) => item.id)).toEqual(["claim-active", "claim-settled"]);
  });

  it("orders by most recently updated within each group", () => {
    const olderActive = claim({ id: "claim-old", currentStatus: "ACTION_REQUIRED", updatedAt: new Date("2026-01-01") });
    const newerActive = claim({ id: "claim-new", currentStatus: "UNDER_VERIFICATION", updatedAt: new Date("2026-02-01") });
    const olderSettled = claim({ id: "claim-settled-old", currentStatus: "SETTLED", updatedAt: new Date("2026-01-15") });
    const newerSettled = claim({ id: "claim-settled-new", currentStatus: "SETTLED", updatedAt: new Date("2026-03-01") });

    expect(sortClaimsForList([olderSettled, newerActive, olderActive, newerSettled]).map((item) => item.id)).toEqual([
      "claim-new",
      "claim-old",
      "claim-settled-new",
      "claim-settled-old",
    ]);
  });

  it("breaks ties by claim id ascending", () => {
    const left = claim({ id: "claim-a", currentStatus: "READY", updatedAt: new Date("2026-01-01") });
    const right = claim({ id: "claim-b", currentStatus: "READY", updatedAt: new Date("2026-01-01") });
    expect(sortClaimsForList([right, left]).map((item) => item.id)).toEqual(["claim-a", "claim-b"]);
  });
});

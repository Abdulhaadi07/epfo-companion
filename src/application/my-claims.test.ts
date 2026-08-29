import { describe, expect, it, vi } from "vitest";
import type { ClaimRecord, UserRecord } from "@/repositories";
import { getMyClaimsView } from "./my-claims";

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

const otherUser: UserRecord = {
  ...user,
  id: "synthetic-user-other",
  uan: "100000000099",
  displayName: "Other Citizen",
};

function claim(
  partial: Partial<ClaimRecord> & Pick<ClaimRecord, "id" | "currentStatus" | "updatedAt">,
): ClaimRecord {
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

function depsWithClaims(claims: ClaimRecord[], claimUser: UserRecord = user) {
  return {
    findUserById: vi.fn(async (userId: string) => (userId === claimUser.id ? claimUser : undefined)),
    listClaimsByUserId: vi.fn(async (userId: string) =>
      claims.filter((item) => item.userId === userId),
    ),
  };
}

describe("getMyClaimsView", () => {
  it("loads claims for the authenticated user id", async () => {
    const readyClaim = claim({ id: "claim-ready", currentStatus: "READY", updatedAt: new Date("2026-01-02") });
    const deps = depsWithClaims([readyClaim]);

    const view = await getMyClaimsView(user.id, deps);

    expect(deps.listClaimsByUserId).toHaveBeenCalledWith(user.id);
    expect(view?.claims).toHaveLength(1);
    expect(view?.claims[0]?.status).toBe("READY");
    expect(view?.greeting.displayName).toBe("Aarav Mehta");
  });

  it("scopes claims to the requested user id", async () => {
    const ownClaim = claim({ id: "claim-own", currentStatus: "READY", updatedAt: new Date("2026-01-02") });
    const otherClaim = claim({
      id: "claim-other",
      userId: otherUser.id,
      currentStatus: "SETTLED",
      updatedAt: new Date("2026-02-01"),
    });
    const deps = {
      findUserById: vi.fn(async (userId: string) => {
        if (userId === user.id) return user;
        if (userId === otherUser.id) return otherUser;
        return undefined;
      }),
      listClaimsByUserId: vi.fn(async (userId: string) =>
        [ownClaim, otherClaim].filter((item) => item.userId === userId),
      ),
    };

    const view = await getMyClaimsView(user.id, deps);

    expect(view?.claims).toHaveLength(1);
    expect(view?.claims[0]?.id).toBe("claim-own");
  });

  it("supports multiple claims per user", async () => {
    const claims = [
      claim({ id: "claim-a", currentStatus: "UNDER_VERIFICATION", updatedAt: new Date("2026-02-01") }),
      claim({ id: "claim-b", currentStatus: "SETTLED", updatedAt: new Date("2026-03-01") }),
    ];
    const view = await getMyClaimsView(user.id, depsWithClaims(claims));

    expect(view?.claims).toHaveLength(2);
  });

  it("orders non-settled claims before settled claims and by updated date", async () => {
    const claims = [
      claim({ id: "claim-settled-old", currentStatus: "SETTLED", updatedAt: new Date("2026-03-01") }),
      claim({ id: "claim-active-old", currentStatus: "ACTION_REQUIRED", updatedAt: new Date("2026-01-01") }),
      claim({ id: "claim-active-new", currentStatus: "UNDER_VERIFICATION", updatedAt: new Date("2026-02-01") }),
      claim({ id: "claim-settled-new", currentStatus: "SETTLED", updatedAt: new Date("2026-04-01") }),
    ];
    const view = await getMyClaimsView(user.id, depsWithClaims(claims));

    expect(view?.claims.map((item) => item.id)).toEqual([
      "claim-active-new",
      "claim-active-old",
      "claim-settled-new",
      "claim-settled-old",
    ]);
  });

  it("breaks ordering ties by claim id ascending", async () => {
    const claims = [
      claim({ id: "claim-b", currentStatus: "READY", updatedAt: new Date("2026-01-01") }),
      claim({ id: "claim-a", currentStatus: "READY", updatedAt: new Date("2026-01-01") }),
    ];
    const view = await getMyClaimsView(user.id, depsWithClaims(claims));

    expect(view?.claims.map((item) => item.id)).toEqual(["claim-a", "claim-b"]);
  });

  it("applies reason-specific presentation for action required claims", async () => {
    const actionRequired = claim({
      id: "claim-action",
      currentStatus: "ACTION_REQUIRED",
      reasonCodes: ["BANK_NAME_MISMATCH"],
      updatedAt: new Date("2026-01-05"),
    });
    const view = await getMyClaimsView(user.id, depsWithClaims([actionRequired]));
    const item = view?.claims[0];

    expect(item?.reasonSummaryKeys).toEqual([
      "claim.reason.bankAccountMismatch",
    ]);
    expect(item?.presentation.situationKey).toBe(
      "claim.presentation.situation.actionRequired.bankAccountMismatch",
    );
    expect(item?.actionRequired).toBe(true);
    expect(item?.primaryAction.labelKey).toBe("claim.action.updateBankDetails");
  });

  it("marks settled claims without requiring action", async () => {
    const settled = claim({
      id: "claim-settled",
      currentStatus: "SETTLED",
      updatedAt: new Date("2026-03-01"),
    });
    const view = await getMyClaimsView(user.id, depsWithClaims([settled]));
    const item = view?.claims[0];

    expect(item?.isSettled).toBe(true);
    expect(item?.actionRequired).toBe(false);
    expect(item?.presentation.labelKey).toBe("claim.status.settled");
  });

  it("returns an explicit empty state when the user has no claims", async () => {
    const view = await getMyClaimsView(user.id, depsWithClaims([]));

    expect(view?.isEmpty).toBe(true);
    expect(view?.claims).toEqual([]);
  });

  it("returns null when the user does not exist", async () => {
    const view = await getMyClaimsView("missing-user", {
      findUserById: vi.fn(async () => undefined),
      listClaimsByUserId: vi.fn(async () => []),
    });

    expect(view).toBeNull();
  });

  it("only trusts the server-provided user id for repository access", async () => {
    const readyClaim = claim({ id: "claim-ready", currentStatus: "READY", updatedAt: new Date("2026-01-02") });
    const deps = depsWithClaims([readyClaim]);

    await getMyClaimsView(user.id, deps);

    expect(deps.listClaimsByUserId).toHaveBeenCalledTimes(1);
    expect(deps.listClaimsByUserId).toHaveBeenCalledWith(user.id);
    expect(deps.listClaimsByUserId).not.toHaveBeenCalledWith(otherUser.id);
  });

  it("provides a navigation target for active claims", async () => {
    const active = claim({
      id: "claim-active",
      currentStatus: "UNDER_VERIFICATION",
      updatedAt: new Date("2026-02-01"),
    });
    const view = await getMyClaimsView(user.id, depsWithClaims([active]));

    expect(view?.claims[0]?.viewHref).toBe("/home");
    expect(view?.claims[0]?.primaryAction.href).toBe("/claim/status");
  });

  it("does not expose reason-code enum names in the view model", async () => {
    const actionRequired = claim({
      id: "claim-action",
      currentStatus: "ACTION_REQUIRED",
      reasonCodes: ["BANK_NAME_MISMATCH"],
      updatedAt: new Date("2026-01-05"),
    });
    const view = await getMyClaimsView(user.id, depsWithClaims([actionRequired]));
    const serialized = JSON.stringify(view);

    expect(serialized).not.toContain("BANK_NAME_MISMATCH");
  });
});

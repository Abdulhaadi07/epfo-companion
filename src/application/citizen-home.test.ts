import { describe, expect, it, vi } from "vitest";
import type { ClaimEventRecord, ClaimRecord, EmploymentRecord, PFAccountRecord, UserRecord } from "@/repositories";
import { getCitizenHomeView } from "./citizen-home";
import { buildTimelinePreview } from "./timeline";
import { toClaimEntity } from "./claim-mapper";

type ScenarioId = "ready" | "under_verification" | "action_required" | "rejected";

const scenarioUsers: Record<ScenarioId, UserRecord> = {
  ready: {
    id: "synthetic-user-ready",
    uan: "100000000001",
    passwordHash: "hashed",
    displayName: "Aarav Mehta",
    identityStatus: "READY",
    preferredLanguage: "en",
    preferredRegion: "Maharashtra",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  under_verification: {
    id: "synthetic-user-under_verification",
    uan: "100000000002",
    passwordHash: "hashed",
    displayName: "Mira Sen",
    identityStatus: "UNDER_VERIFICATION",
    preferredLanguage: "en",
    preferredRegion: "Maharashtra",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  action_required: {
    id: "synthetic-user-action_required",
    uan: "100000000003",
    passwordHash: "hashed",
    displayName: "Kabir Rao",
    identityStatus: "READY",
    preferredLanguage: "en",
    preferredRegion: "Maharashtra",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  rejected: {
    id: "synthetic-user-rejected",
    uan: "100000000004",
    passwordHash: "hashed",
    displayName: "Tara Iyer",
    identityStatus: "READY",
    preferredLanguage: "en",
    preferredRegion: "Maharashtra",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
};

const scenarioEmployers: Record<ScenarioId, string> = {
  ready: "Hindustan Textiles Pvt Ltd",
  under_verification: "Bengaluru Tech Park Services Ltd",
  action_required: "Pune Precision Components Ltd",
  rejected: "Chennai Garment Exports Pvt Ltd",
};

function employmentFor(scenario: ScenarioId): EmploymentRecord {
  const dates = {
    ready: { startDate: "2020-04-01", endDate: "2025-12-31" },
    under_verification: { startDate: "2019-06-15", endDate: "2025-11-30" },
    action_required: { startDate: "2018-03-01", endDate: "2025-10-15" },
    rejected: { startDate: "2021-01-10", endDate: "2025-09-30" },
  } as const;

  return {
    id: `synthetic-employment-${scenario}`,
    userId: scenarioUsers[scenario].id,
    employerName: scenarioEmployers[scenario],
    startDate: dates[scenario].startDate,
    endDate: dates[scenario].endDate,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };
}

function pfAccountFor(scenario: ScenarioId, employment: EmploymentRecord): PFAccountRecord {
  const readiness = {
    ready: { bankStatus: "READY", kycStatus: "READY", balanceInPaise: 12_500_000, bankDisplayName: "State Bank of India" },
    under_verification: { bankStatus: "UNDER_VERIFICATION", kycStatus: "UNDER_VERIFICATION", balanceInPaise: 18_425_000, bankDisplayName: "HDFC Bank" },
    action_required: { bankStatus: "ACTION_REQUIRED", kycStatus: "READY", balanceInPaise: 9_758_000, bankDisplayName: "ICICI Bank" },
    rejected: { bankStatus: "READY", kycStatus: "REJECTED", balanceInPaise: 6_334_500, bankDisplayName: "Axis Bank" },
  } as const;

  return {
    id: `synthetic-pf-account-${scenario}`,
    userId: scenarioUsers[scenario].id,
    employmentId: employment.id,
    syntheticMemberId: `SYN-MEMBER-${scenario.toUpperCase()}`,
    balanceInPaise: readiness[scenario].balanceInPaise,
    bankDisplayName: readiness[scenario].bankDisplayName,
    bankStatus: readiness[scenario].bankStatus,
    kycStatus: readiness[scenario].kycStatus,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };
}

function claimFor(scenario: ScenarioId, pfAccount: PFAccountRecord): ClaimRecord {
  const claimConfig = {
    ready: { currentStatus: "READY" as const, reasonCodes: [] as const },
    under_verification: { currentStatus: "UNDER_VERIFICATION" as const, reasonCodes: [] as const },
    action_required: { currentStatus: "ACTION_REQUIRED" as const, reasonCodes: ["BANK_NAME_MISMATCH"] as const },
    rejected: { currentStatus: "REJECTED" as const, reasonCodes: ["KYC_INCOMPLETE"] as const },
  };

  return {
    id: `synthetic-claim-${scenario}`,
    userId: scenarioUsers[scenario].id,
    pfAccountId: pfAccount.id,
    claimType: "FINAL_SETTLEMENT",
    currentStatus: claimConfig[scenario].currentStatus,
    reasonCodes: [...claimConfig[scenario].reasonCodes],
    amountInPaise: pfAccount.balanceInPaise,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-04"),
  };
}

function eventsFor(scenario: ScenarioId, claim: ClaimRecord): ClaimEventRecord[] {
  const base = [
    { id: `${claim.id}-1`, claimId: claim.id, eventType: "CLAIM_MARKED_READY" as const, reasonCode: null, occurredAt: new Date("2026-01-02"), metadata: null },
    { id: `${claim.id}-2`, claimId: claim.id, eventType: "CLAIM_SUBMITTED" as const, reasonCode: null, occurredAt: new Date("2026-01-03"), metadata: null },
    { id: `${claim.id}-3`, claimId: claim.id, eventType: "VERIFICATION_STARTED" as const, reasonCode: null, occurredAt: new Date("2026-01-04"), metadata: null },
  ];

  if (scenario === "ready") {
    return [base[0]];
  }
  if (scenario === "under_verification") {
    return base;
  }
  if (scenario === "action_required") {
    return [
      ...base,
      { id: `${claim.id}-4`, claimId: claim.id, eventType: "ACTION_REQUIRED" as const, reasonCode: "BANK_NAME_MISMATCH" as const, occurredAt: new Date("2026-01-05"), metadata: null },
    ];
  }
  return [
    ...base,
    { id: `${claim.id}-4`, claimId: claim.id, eventType: "CLAIM_REJECTED" as const, reasonCode: "KYC_INCOMPLETE" as const, occurredAt: new Date("2026-01-05"), metadata: null },
  ];
}

function depsForScenario(scenario: ScenarioId) {
  const user = scenarioUsers[scenario];
  const employment = employmentFor(scenario);
  const pfAccount = pfAccountFor(scenario, employment);
  const claim = claimFor(scenario, pfAccount);
  const events = eventsFor(scenario, claim);

  return {
    findUserById: vi.fn(async () => user),
    listEmploymentByUserId: vi.fn(async () => [employment]),
    listPfAccountsByUserId: vi.fn(async () => [pfAccount]),
    listClaimsByUserId: vi.fn(async () => [claim]),
    listClaimEventsByClaimId: vi.fn(async () => events),
  };
}

describe("getCitizenHomeView", () => {
  it.each([
    ["ready", "Aarav Mehta", "READY", "readiness.readyToProceed", "claim.action.start"],
    ["under_verification", "Mira Sen", "UNDER_VERIFICATION", "readiness.checksInProgress", "claim.action.viewStatus"],
    ["action_required", "Kabir Rao", "ACTION_REQUIRED", "readiness.detailsNeedAttention", "claim.action.updateBankDetails"],
    ["rejected", "Tara Iyer", "REJECTED", "readiness.checksCouldNotBeCompleted", "claim.action.completeKyc"],
  ] as const)("builds the %s synthetic scenario", async (scenario, displayName, status, readinessLabelKey, actionLabelKey) => {
    const view = await getCitizenHomeView(scenarioUsers[scenario].id, depsForScenario(scenario));

    expect(view).toMatchObject({
      greeting: { displayName },
      activeClaim: {
        status,
        presentation: { actionLabelKey },
      },
      readiness: { overallLabelKey: readinessLabelKey },
    });
    expect(view?.accountSummary.balanceDisplay).toContain("₹");
    expect(view?.employmentSummary.employerName).toBe(scenarioEmployers[scenario]);
  });

  it("includes reason-specific summaries and allowed actions for action required claims", async () => {
    const view = await getCitizenHomeView(scenarioUsers.action_required.id, depsForScenario("action_required"));

    expect(view?.activeClaim?.reasonSummaryKeys).toEqual([
      "claim.reason.bankAccountMismatch",
    ]);
    expect(view?.activeClaim?.allowedActions).toEqual(["UPDATE_BANK_DETAILS"]);
    expect(view?.activeClaim?.presentation.situationKey).toBe(
      "claim.presentation.situation.actionRequired.bankAccountMismatch",
    );
  });

  it("includes reason-specific summaries and allowed actions for rejected claims", async () => {
    const view = await getCitizenHomeView(scenarioUsers.rejected.id, depsForScenario("rejected"));

    expect(view?.activeClaim?.reasonSummaryKeys).toEqual([
      "claim.reason.kycIncomplete",
    ]);
    expect(view?.activeClaim?.allowedActions).toContain("COMPLETE_KYC");
    expect(view?.activeClaim?.allowedActions).toContain("VIEW_REJECTION_REASON");
    expect(view?.activeClaim?.presentation.situationKey).toBe(
      "claim.presentation.situation.rejected.kycIncomplete",
    );
  });

  it("builds a short timeline preview from claim events", async () => {
    const scenario = "action_required";
    const deps = depsForScenario(scenario);
    const view = await getCitizenHomeView(scenarioUsers[scenario].id, deps);
    const claim = claimFor(scenario, pfAccountFor(scenario, employmentFor(scenario)));
    const events = eventsFor(scenario, claim);
    const entity = toClaimEntity(claim, events);

    expect(view?.activeClaim?.timelinePreview).toEqual(buildTimelinePreview(entity.timeline));
    expect(view?.activeClaim?.timelinePreview.at(-1)?.labelKey).toBe("timeline.reason.bankAccountMismatch");
  });

  it("returns an explicit empty active claim state when no claims exist", async () => {
    const scenario = "ready";
    const user = scenarioUsers[scenario];
    const employment = employmentFor(scenario);
    const pfAccount = pfAccountFor(scenario, employment);

    const view = await getCitizenHomeView(user.id, {
      findUserById: vi.fn(async () => user),
      listEmploymentByUserId: vi.fn(async () => [employment]),
      listPfAccountsByUserId: vi.fn(async () => [pfAccount]),
      listClaimsByUserId: vi.fn(async () => []),
      listClaimEventsByClaimId: vi.fn(async () => []),
    });

    expect(view?.activeClaim).toBeNull();
    expect(view?.readiness.overallLabelKey).toBe("readiness.readyToProceed");
  });

  it("selects the active claim deterministically when multiple claims exist", async () => {
    const scenario = "under_verification";
    const user = scenarioUsers[scenario];
    const employment = employmentFor(scenario);
    const pfAccount = pfAccountFor(scenario, employment);
    const settledClaim = {
      ...claimFor("ready", pfAccount),
      id: "synthetic-claim-settled",
      currentStatus: "SETTLED" as const,
      updatedAt: new Date("2026-03-01"),
    };
    const activeClaim = claimFor(scenario, pfAccount);

    const view = await getCitizenHomeView(user.id, {
      findUserById: vi.fn(async () => user),
      listEmploymentByUserId: vi.fn(async () => [employment]),
      listPfAccountsByUserId: vi.fn(async () => [pfAccount]),
      listClaimsByUserId: vi.fn(async () => [settledClaim, activeClaim]),
      listClaimEventsByClaimId: vi.fn(async (claimId) => eventsFor(scenario, activeClaim).filter((event) => event.claimId === claimId)),
    });

    expect(view?.activeClaim?.id).toBe(activeClaim.id);
    expect(view?.activeClaim?.status).toBe("UNDER_VERIFICATION");
  });

  it("returns null when the user does not exist", async () => {
    const view = await getCitizenHomeView("missing-user", {
      findUserById: vi.fn(async () => undefined),
      listEmploymentByUserId: vi.fn(async () => []),
      listPfAccountsByUserId: vi.fn(async () => []),
      listClaimsByUserId: vi.fn(async () => []),
      listClaimEventsByClaimId: vi.fn(async () => []),
    });

    expect(view).toBeNull();
  });

  it("uses user-specific balance values in the account summary", async () => {
    const underVerification = await getCitizenHomeView(
      scenarioUsers.under_verification.id,
      depsForScenario("under_verification"),
    );
    const ready = await getCitizenHomeView(
      scenarioUsers.ready.id,
      depsForScenario("ready"),
    );

    expect(underVerification?.accountSummary.balanceDisplay).not.toBe(ready?.accountSummary.balanceDisplay);
  });
});

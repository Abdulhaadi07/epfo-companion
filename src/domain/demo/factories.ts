import { claimSchema, createClaim, transitionClaim } from "../claims";
import type { ClaimEntity, ClaimReasonCode } from "../claims";
import type { DemoScenario, DemoScenarioId, Citizen, Employment, PFAccount } from "./types";

const CREATED_AT = "2026-01-01T00:00:00.000Z";
const READY_AT = "2026-01-02T00:00:00.000Z";
const SUBMITTED_AT = "2026-01-03T00:00:00.000Z";
const VERIFIED_AT = "2026-01-04T00:00:00.000Z";

type ScenarioProfile = {
  citizen: Citizen;
  employment: Employment;
  pfAccount: PFAccount;
};

const SCENARIO_PROFILES: Record<DemoScenarioId, ScenarioProfile> = {
  READY: {
    citizen: {
      id: "demo-citizen-ready",
      name: "Aarav Mehta",
      demoUan: "DEMO-UAN-000001",
    },
    employment: {
      id: "demo-employment-ready",
      citizenId: "demo-citizen-ready",
      employerName: "Hindustan Textiles Pvt Ltd",
      startDate: "2020-04-01",
      endDate: "2025-12-31",
    },
    pfAccount: {
      id: "demo-pf-account-ready",
      citizenId: "demo-citizen-ready",
      employmentId: "demo-employment-ready",
      demoMemberId: "DEMO-MEMBER-000001",
      balanceInPaise: 12_500_000,
      bankDisplayName: "State Bank of India",
    },
  },
  UNDER_VERIFICATION: {
    citizen: {
      id: "demo-citizen-under-verification",
      name: "Mira Sen",
      demoUan: "DEMO-UAN-000002",
    },
    employment: {
      id: "demo-employment-under-verification",
      citizenId: "demo-citizen-under-verification",
      employerName: "Bengaluru Tech Park Services Ltd",
      startDate: "2019-06-15",
      endDate: "2025-11-30",
    },
    pfAccount: {
      id: "demo-pf-account-under-verification",
      citizenId: "demo-citizen-under-verification",
      employmentId: "demo-employment-under-verification",
      demoMemberId: "DEMO-MEMBER-000002",
      balanceInPaise: 18_425_000,
      bankDisplayName: "HDFC Bank",
    },
  },
  ACTION_REQUIRED: {
    citizen: {
      id: "demo-citizen-action-required",
      name: "Kabir Rao",
      demoUan: "DEMO-UAN-000003",
    },
    employment: {
      id: "demo-employment-action-required",
      citizenId: "demo-citizen-action-required",
      employerName: "Pune Precision Components Ltd",
      startDate: "2018-03-01",
      endDate: "2025-10-15",
    },
    pfAccount: {
      id: "demo-pf-account-action-required",
      citizenId: "demo-citizen-action-required",
      employmentId: "demo-employment-action-required",
      demoMemberId: "DEMO-MEMBER-000003",
      balanceInPaise: 9_758_000,
      bankDisplayName: "ICICI Bank",
    },
  },
  REJECTED: {
    citizen: {
      id: "demo-citizen-rejected",
      name: "Tara Iyer",
      demoUan: "DEMO-UAN-000004",
    },
    employment: {
      id: "demo-employment-rejected",
      citizenId: "demo-citizen-rejected",
      employerName: "Chennai Garment Exports Pvt Ltd",
      startDate: "2021-01-10",
      endDate: "2025-09-30",
    },
    pfAccount: {
      id: "demo-pf-account-rejected",
      citizenId: "demo-citizen-rejected",
      employmentId: "demo-employment-rejected",
      demoMemberId: "DEMO-MEMBER-000004",
      balanceInPaise: 6_334_500,
      bankDisplayName: "Axis Bank",
    },
  },
};

function baseClaim(id: DemoScenarioId, citizenId: string): ClaimEntity {
  return createClaim({
    id: `demo-claim-${id.toLowerCase()}-001`,
    citizenId,
    createdAt: CREATED_AT,
  });
}

function markReady(claim: ClaimEntity): ClaimEntity {
  return transitionClaim(claim, { type: "CLAIM_MARKED_READY" }, READY_AT);
}

function submittedClaim(id: DemoScenarioId, citizenId: string): ClaimEntity {
  return transitionClaim(markReady(baseClaim(id, citizenId)), { type: "CLAIM_SUBMITTED" }, SUBMITTED_AT);
}

function underVerificationClaim(id: DemoScenarioId, citizenId: string): ClaimEntity {
  return transitionClaim(submittedClaim(id, citizenId), { type: "VERIFICATION_STARTED" }, VERIFIED_AT);
}

function scenario(
  id: DemoScenarioId,
  label: string,
  claim: ClaimEntity,
  requiresUserAction: boolean,
  expectedReasonCode?: ClaimReasonCode,
): DemoScenario {
  const profile = SCENARIO_PROFILES[id];
  return {
    id,
    label,
    intendedStatus: claim.status,
    requiresUserAction,
    ...(expectedReasonCode ? { expectedReasonCode } : {}),
    citizen: profile.citizen,
    employment: profile.employment,
    pfAccount: profile.pfAccount,
    claim: claimSchema.parse(claim),
  };
}

export function createReadyScenario(): DemoScenario {
  const { citizen } = SCENARIO_PROFILES.READY;
  return scenario("READY", "Ready to submit", markReady(baseClaim("READY", citizen.id)), true);
}

export function createUnderVerificationScenario(): DemoScenario {
  const { citizen } = SCENARIO_PROFILES.UNDER_VERIFICATION;
  return scenario(
    "UNDER_VERIFICATION",
    "Under verification",
    underVerificationClaim("UNDER_VERIFICATION", citizen.id),
    false,
  );
}

export function createActionRequiredScenario(): DemoScenario {
  const { citizen } = SCENARIO_PROFILES.ACTION_REQUIRED;
  const claim = transitionClaim(underVerificationClaim("ACTION_REQUIRED", citizen.id), {
    type: "ACTION_REQUIRED",
    reasonCode: "BANK_NAME_MISMATCH",
  }, VERIFIED_AT);
  return scenario("ACTION_REQUIRED", "Action required", claim, true, "BANK_NAME_MISMATCH");
}

export function createRejectedScenario(): DemoScenario {
  const { citizen } = SCENARIO_PROFILES.REJECTED;
  const claim = transitionClaim(underVerificationClaim("REJECTED", citizen.id), {
    type: "CLAIM_REJECTED",
    reasonCode: "KYC_INCOMPLETE",
  }, VERIFIED_AT);
  return scenario("REJECTED", "Rejected", claim, true, "KYC_INCOMPLETE");
}

export const demoScenarioProfiles = SCENARIO_PROFILES;

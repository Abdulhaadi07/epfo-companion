import { claimSchema, createClaim, transitionClaim } from "../claims";
import type { ClaimEntity, ClaimReasonCode } from "../claims";
import type { DemoScenario, DemoScenarioId, Citizen, Employment, PFAccount } from "./types";

const CREATED_AT = "2026-01-01T00:00:00.000Z";
const READY_AT = "2026-01-02T00:00:00.000Z";
const SUBMITTED_AT = "2026-01-03T00:00:00.000Z";
const VERIFIED_AT = "2026-01-04T00:00:00.000Z";

const citizen: Citizen = {
  id: "demo-citizen-001",
  name: "Demo Citizen One",
  demoUan: "DEMO-UAN-000001",
};

const employment: Employment = {
  id: "demo-employment-001",
  citizenId: citizen.id,
  employerName: "Example Works Pvt Ltd (Demo)",
  startDate: "2020-04-01",
  endDate: "2025-12-31",
};

const pfAccount: PFAccount = {
  id: "demo-pf-account-001",
  citizenId: citizen.id,
  employmentId: employment.id,
  demoMemberId: "DEMO-MEMBER-000001",
  balanceInPaise: 12500000,
  bankDisplayName: "Demo Bank (Synthetic)",
};

function baseClaim(id: DemoScenarioId): ClaimEntity {
  return createClaim({
    id: `demo-claim-${id.toLowerCase()}-001`,
    citizenId: citizen.id,
    createdAt: CREATED_AT,
  });
}

function markReady(claim: ClaimEntity): ClaimEntity {
  return transitionClaim(claim, { type: "CLAIM_MARKED_READY" }, READY_AT);
}

function submittedClaim(id: DemoScenarioId): ClaimEntity {
  return transitionClaim(markReady(baseClaim(id)), { type: "CLAIM_SUBMITTED" }, SUBMITTED_AT);
}

function underVerificationClaim(id: DemoScenarioId): ClaimEntity {
  return transitionClaim(submittedClaim(id), { type: "VERIFICATION_STARTED" }, VERIFIED_AT);
}

function scenario(
  id: DemoScenarioId,
  label: string,
  claim: ClaimEntity,
  requiresUserAction: boolean,
  expectedReasonCode?: ClaimReasonCode,
): DemoScenario {
  return {
    id,
    label,
    intendedStatus: claim.status,
    requiresUserAction,
    ...(expectedReasonCode ? { expectedReasonCode } : {}),
    citizen,
    employment,
    pfAccount,
    claim: claimSchema.parse(claim),
  };
}

export function createReadyScenario(): DemoScenario {
  return scenario("READY", "Ready to submit", markReady(baseClaim("READY")), true);
}

export function createUnderVerificationScenario(): DemoScenario {
  return scenario("UNDER_VERIFICATION", "Under verification", underVerificationClaim("UNDER_VERIFICATION"), false);
}

export function createActionRequiredScenario(): DemoScenario {
  const claim = transitionClaim(underVerificationClaim("ACTION_REQUIRED"), {
    type: "ACTION_REQUIRED",
    reasonCode: "BANK_NAME_MISMATCH",
  }, VERIFIED_AT);
  return scenario("ACTION_REQUIRED", "Action required", claim, true, "BANK_NAME_MISMATCH");
}

export function createRejectedScenario(): DemoScenario {
  const claim = transitionClaim(underVerificationClaim("REJECTED"), {
    type: "CLAIM_REJECTED",
    reasonCode: "KYC_INCOMPLETE",
  }, VERIFIED_AT);
  return scenario("REJECTED", "Rejected", claim, true, "KYC_INCOMPLETE");
}

import { hash } from "bcryptjs";
import { createDemoScenario, DEMO_SCENARIO_IDS, type DemoScenarioId } from "../domain/demo";
import type { ClaimDomainEvent } from "../domain/claims";
import { claimEvents, claims, employmentRecords, pfAccounts, users, type ReadinessStatus } from "./schema";

const scenarioNames: Record<DemoScenarioId, string> = {
  READY: "Aarav Mehta",
  UNDER_VERIFICATION: "Mira Sen",
  ACTION_REQUIRED: "Kabir Rao",
  REJECTED: "Tara Iyer",
};

const scenarioUans: Record<DemoScenarioId, string> = {
  READY: "100000000001",
  UNDER_VERIFICATION: "100000000002",
  ACTION_REQUIRED: "100000000003",
  REJECTED: "100000000004",
};

const scenarioRegions: Record<DemoScenarioId, string> = {
  READY: "Maharashtra",
  UNDER_VERIFICATION: "Karnataka",
  ACTION_REQUIRED: "Maharashtra",
  REJECTED: "Tamil Nadu",
};

export const SYNTHETIC_USER_IDS = DEMO_SCENARIO_IDS.map((scenarioId) => `synthetic-user-${scenarioId.toLowerCase()}`);
export const SYNTHETIC_CLAIM_IDS = DEMO_SCENARIO_IDS.map((scenarioId) => `synthetic-claim-${scenarioId.toLowerCase()}`);

const scenarioReadiness: Record<DemoScenarioId, {
  identityStatus: ReadinessStatus;
  bankStatus: ReadinessStatus;
  kycStatus: ReadinessStatus;
}> = {
  READY: { identityStatus: "READY", bankStatus: "READY", kycStatus: "READY" },
  UNDER_VERIFICATION: {
    identityStatus: "UNDER_VERIFICATION",
    bankStatus: "UNDER_VERIFICATION",
    kycStatus: "UNDER_VERIFICATION",
  },
  ACTION_REQUIRED: { identityStatus: "READY", bankStatus: "ACTION_REQUIRED", kycStatus: "READY" },
  REJECTED: { identityStatus: "READY", bankStatus: "READY", kycStatus: "REJECTED" },
};

export const seedScenarioReadiness = scenarioReadiness;

export type SeedData = {
  users: typeof users.$inferInsert[];
  employmentRecords: typeof employmentRecords.$inferInsert[];
  pfAccounts: typeof pfAccounts.$inferInsert[];
  claims: typeof claims.$inferInsert[];
  claimEvents: typeof claimEvents.$inferInsert[];
};

export async function buildSeedData(password = "sample-password"): Promise<SeedData> {
  const passwordHash = await hash(password, 10);
  const data: SeedData = { users: [], employmentRecords: [], pfAccounts: [], claims: [], claimEvents: [] };

  for (const scenarioId of DEMO_SCENARIO_IDS) {
    const scenario = createDemoScenario(scenarioId);
    const prefix = scenarioId.toLowerCase();
    const userId = `synthetic-user-${prefix}`;
    const employmentId = `synthetic-employment-${prefix}`;
    const pfAccountId = `synthetic-pf-account-${prefix}`;
    const claimId = `synthetic-claim-${prefix}`;
    const readiness = scenarioReadiness[scenarioId];

    data.users.push({
      id: userId,
      uan: scenarioUans[scenarioId],
      passwordHash,
      displayName: scenarioNames[scenarioId],
      identityStatus: readiness.identityStatus,
      preferredLanguage: "en",
      preferredRegion: scenarioRegions[scenarioId],
    });
    data.employmentRecords.push({
      id: employmentId,
      userId,
      employerName: scenario.employment.employerName,
      startDate: scenario.employment.startDate,
      endDate: scenario.employment.endDate,
    });
    data.pfAccounts.push({
      id: pfAccountId,
      userId,
      employmentId,
      syntheticMemberId: `SYN-MEMBER-${prefix.toUpperCase()}`,
      balanceInPaise: scenario.pfAccount.balanceInPaise,
      bankDisplayName: scenario.pfAccount.bankDisplayName,
      bankStatus: readiness.bankStatus,
      kycStatus: readiness.kycStatus,
    });
    data.claims.push({
      id: claimId,
      userId,
      pfAccountId,
      claimType: scenario.claim.type,
      currentStatus: scenario.claim.status,
      reasonCodes: [...scenario.claim.reasonCodes],
      amountInPaise: scenario.pfAccount.balanceInPaise,
      createdAt: new Date(scenario.claim.createdAt),
      updatedAt: new Date(scenario.claim.updatedAt),
    });
    for (const event of scenario.claim.timeline) {
      const { id, occurredAt, type, ...eventMetadata } = event as ClaimDomainEvent & { id: string; occurredAt: string };
      data.claimEvents.push({
        id: `${claimId}-${id.split("-").at(-1)}`,
        claimId,
        eventType: type,
        reasonCode: "reasonCode" in event ? event.reasonCode ?? null : null,
        occurredAt: new Date(occurredAt),
        metadata: Object.keys(eventMetadata).length ? eventMetadata : null,
      });
    }
  }
  return data;
}

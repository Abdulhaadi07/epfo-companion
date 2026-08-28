import { compare } from "bcryptjs";
import { describe, expect, it } from "vitest";
import { CLAIM_STATUSES } from "../domain/claims";
import { DEMO_SCENARIO_IDS } from "../domain/demo";
import { buildSeedData, seedScenarioReadiness } from "./seed-data";

describe("synthetic persistence seed", () => {
  it("creates one related account graph for every domain scenario", async () => {
    const data = await buildSeedData("fixture-password");
    expect(data.users).toHaveLength(4);
    expect(data.employmentRecords).toHaveLength(4);
    expect(data.pfAccounts).toHaveLength(4);
    expect(data.claims).toHaveLength(4);
    expect(data.claims.map((claim) => claim.currentStatus)).toEqual(DEMO_SCENARIO_IDS);
    expect(data.claims.every((claim) => CLAIM_STATUSES.includes(claim.currentStatus))).toBe(true);

    for (const user of data.users) {
      const employment = data.employmentRecords.find((row) => row.userId === user.id);
      const account = data.pfAccounts.find((row) => row.userId === user.id);
      const claim = data.claims.find((row) => row.userId === user.id);
      expect(employment).toBeDefined();
      expect(account?.employmentId).toBe(employment?.id);
      const scenarioId = user.id.replace("synthetic-user-", "").toUpperCase() as keyof typeof seedScenarioReadiness;
      expect(user.identityStatus).toBe(seedScenarioReadiness[scenarioId].identityStatus);
      expect(account?.bankStatus).toBe(seedScenarioReadiness[scenarioId].bankStatus);
      expect(account?.kycStatus).toBe(seedScenarioReadiness[scenarioId].kycStatus);
      expect(claim?.pfAccountId).toBe(account?.id);
      expect(data.claimEvents.filter((event) => event.claimId === claim?.id).length).toBeGreaterThan(0);
    }
  });

  it("generates persisted claim events with valid relationships and domain types", async () => {
    const data = await buildSeedData();
    const claimIds = new Set(data.claims.map((claim) => claim.id));
    expect(data.claimEvents).toHaveLength(12);
    expect(data.claimEvents.every((event) => claimIds.has(event.claimId))).toBe(true);
    expect(data.claimEvents.every((event) => event.occurredAt instanceof Date)).toBe(true);
    expect(data.claimEvents.some((event) => event.eventType === "ACTION_REQUIRED" && event.reasonCode === "BANK_NAME_MISMATCH")).toBe(true);
    expect(data.claimEvents.some((event) => event.eventType === "CLAIM_REJECTED" && event.reasonCode === "KYC_INCOMPLETE")).toBe(true);
  });

  it("stores a bcrypt hash rather than the seed password", async () => {
    const data = await buildSeedData("fixture-password");
    expect(data.users[0].passwordHash).not.toBe("fixture-password");
    expect(await compare("fixture-password", data.users[0].passwordHash)).toBe(true);
  });

  it("keeps synthetic identifiers unique", async () => {
    const data = await buildSeedData();
    for (const values of [data.users.map((row) => row.loginId), data.pfAccounts.map((row) => row.syntheticMemberId)]) {
      expect(new Set(values).size).toBe(values.length);
    }
  });
});

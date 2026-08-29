import { compare } from "bcryptjs";
import { describe, expect, it } from "vitest";
import { CLAIM_STATUSES } from "../domain/claims";
import { createDemoScenario, DEMO_SCENARIO_IDS } from "../domain/demo";
import { buildSeedData, seedScenarioReadiness, SYNTHETIC_CLAIM_IDS, SYNTHETIC_USER_IDS } from "./seed-data";

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

  it("builds four distinct synthetic account graphs", async () => {
    const data = await buildSeedData();
    const scenarioIds = DEMO_SCENARIO_IDS;

    expect(new Set(data.users.map((user) => user.displayName)).size).toBe(4);
    expect(new Set(data.employmentRecords.map((row) => row.employerName)).size).toBe(4);
    expect(new Set(data.pfAccounts.map((row) => row.balanceInPaise)).size).toBe(4);
    expect(new Set(data.pfAccounts.map((row) => row.bankDisplayName)).size).toBe(4);

    for (const scenarioId of scenarioIds) {
      const prefix = scenarioId.toLowerCase();
      const scenario = createDemoScenario(scenarioId);
      const user = data.users.find((row) => row.id === `synthetic-user-${prefix}`);
      const employment = data.employmentRecords.find((row) => row.id === `synthetic-employment-${prefix}`);
      const account = data.pfAccounts.find((row) => row.id === `synthetic-pf-account-${prefix}`);
      const claim = data.claims.find((row) => row.id === `synthetic-claim-${prefix}`);

      expect(user?.displayName).toBe(scenario.citizen.name);
      expect(employment?.employerName).toBe(scenario.employment.employerName);
      expect(employment?.startDate).toBe(scenario.employment.startDate);
      expect(employment?.endDate).toBe(scenario.employment.endDate);
      expect(account?.balanceInPaise).toBe(scenario.pfAccount.balanceInPaise);
      expect(account?.bankDisplayName).toBe(scenario.pfAccount.bankDisplayName);
      expect(claim?.currentStatus).toBe(scenario.claim.status);
      expect(claim?.reasonCodes).toEqual([...scenario.claim.reasonCodes]);
      expect(claim?.amountInPaise).toBe(scenario.pfAccount.balanceInPaise);
    }
  });

  it("maps each scenario to the expected readiness and reason codes", async () => {
    const data = await buildSeedData();
    const actionRequired = data.claims.find((claim) => claim.id === "synthetic-claim-action_required");
    const rejected = data.claims.find((claim) => claim.id === "synthetic-claim-rejected");
    const readyAccount = data.pfAccounts.find((account) => account.id === "synthetic-pf-account-ready");
    const verificationAccount = data.pfAccounts.find((account) => account.id === "synthetic-pf-account-under_verification");

    expect(actionRequired?.reasonCodes).toEqual(["BANK_NAME_MISMATCH"]);
    expect(rejected?.reasonCodes).toEqual(["KYC_INCOMPLETE"]);
    expect(readyAccount).toMatchObject({ bankStatus: "READY", kycStatus: "READY" });
    expect(verificationAccount).toMatchObject({
      bankStatus: "UNDER_VERIFICATION",
      kycStatus: "UNDER_VERIFICATION",
    });
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

  it("assigns synthetic UAN values to each scenario user", async () => {
    const data = await buildSeedData();
    const uansByUserId = Object.fromEntries(data.users.map((user) => [user.id, user.uan]));

    expect(uansByUserId["synthetic-user-ready"]).toBe("100000000001");
    expect(uansByUserId["synthetic-user-under_verification"]).toBe("100000000002");
    expect(uansByUserId["synthetic-user-action_required"]).toBe("100000000003");
    expect(uansByUserId["synthetic-user-rejected"]).toBe("100000000004");
  });

  it("keeps synthetic identifiers unique", async () => {
    const data = await buildSeedData();
    for (const values of [data.users.map((row) => row.uan), data.pfAccounts.map((row) => row.syntheticMemberId)]) {
      expect(new Set(values).size).toBe(values.length);
    }
    expect(SYNTHETIC_USER_IDS).toHaveLength(4);
    expect(SYNTHETIC_CLAIM_IDS).toHaveLength(4);
  });

  it("builds deterministic seed payloads across repeated runs", async () => {
    const first = await buildSeedData("fixture-password");
    const second = await buildSeedData("fixture-password");

    const withoutPasswordHashes = (data: Awaited<ReturnType<typeof buildSeedData>>) => ({
      ...data,
      users: data.users.map(({ passwordHash, ...user }) => {
        void passwordHash;
        return user;
      }),
    });

    expect(withoutPasswordHashes(second)).toEqual(withoutPasswordHashes(first));
    expect(await compare("fixture-password", first.users[0].passwordHash)).toBe(true);
    expect(await compare("fixture-password", second.users[0].passwordHash)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { claimSchema } from "../claims";
import { createDemoScenario, demoScenarioFactories } from "./index";
import { DEMO_SCENARIO_IDS, type DemoScenarioId } from "./types";

describe("demo scenario registry", () => {
  it.each(DEMO_SCENARIO_IDS)("creates the %s scenario", (id) => {
    const scenario = createDemoScenario(id);
    expect(scenario.id).toBe(id);
    expect(scenario.claim).toBeDefined();
  });

  it.each(DEMO_SCENARIO_IDS)("creates a valid claim for %s", (id) => {
    const scenario = createDemoScenario(id);
    expect(() => claimSchema.parse(scenario.claim)).not.toThrow();
    expect(scenario.claim.status).toBe(scenario.intendedStatus);
  });

  it("covers every registered scenario factory", () => {
    expect(Object.keys(demoScenarioFactories).sort()).toEqual([...DEMO_SCENARIO_IDS].sort());
  });

  it("uses distinct employer, balance, and bank fixtures per scenario", () => {
    const profiles = DEMO_SCENARIO_IDS.map((id) => createDemoScenario(id));
    expect(new Set(profiles.map((scenario) => scenario.employment.employerName)).size).toBe(4);
    expect(new Set(profiles.map((scenario) => scenario.pfAccount.balanceInPaise)).size).toBe(4);
    expect(new Set(profiles.map((scenario) => scenario.pfAccount.bankDisplayName)).size).toBe(4);
    expect(new Set(profiles.map((scenario) => scenario.citizen.name)).size).toBe(4);
  });

  it("uses the bank mismatch reason for action required", () => {
    const scenario = createDemoScenario("ACTION_REQUIRED");
    expect(scenario.claim.status).toBe("ACTION_REQUIRED");
    expect(scenario.claim.reasonCodes).toEqual(["BANK_NAME_MISMATCH"]);
    expect(scenario.expectedReasonCode).toBe("BANK_NAME_MISMATCH");
  });

  it("uses the incomplete KYC reason for rejected", () => {
    const scenario = createDemoScenario("REJECTED");
    expect(scenario.claim.status).toBe("REJECTED");
    expect(scenario.claim.reasonCodes).toEqual(["KYC_INCOMPLETE"]);
    expect(scenario.expectedReasonCode).toBe("KYC_INCOMPLETE");
  });

  it("does not construct invalid claim states", () => {
    for (const id of DEMO_SCENARIO_IDS) {
      const scenario = createDemoScenario(id as DemoScenarioId);
      expect(scenario.claim.timeline.at(-1)?.type).toBe(
        id === "READY" ? "CLAIM_MARKED_READY" : id === "UNDER_VERIFICATION" ? "VERIFICATION_STARTED" : id === "ACTION_REQUIRED" ? "ACTION_REQUIRED" : "CLAIM_REJECTED",
      );
    }
  });
});

import type { ClaimEntity, ClaimReasonCode, ClaimStatus } from "../claims";

export type Citizen = {
  id: string;
  name: string;
  demoUan: string;
};

export type Employment = {
  id: string;
  citizenId: Citizen["id"];
  employerName: string;
  startDate: string;
  endDate: string;
};

export type PFAccount = {
  id: string;
  citizenId: Citizen["id"];
  employmentId: Employment["id"];
  demoMemberId: string;
  balanceInPaise: number;
  bankDisplayName: string;
};

export const DEMO_SCENARIO_IDS = [
  "READY",
  "UNDER_VERIFICATION",
  "ACTION_REQUIRED",
  "REJECTED",
] as const;

export type DemoScenarioId = (typeof DEMO_SCENARIO_IDS)[number];

export type DemoScenario = {
  id: DemoScenarioId;
  label: string;
  intendedStatus: ClaimStatus;
  requiresUserAction: boolean;
  expectedReasonCode?: ClaimReasonCode;
  citizen: Citizen;
  employment: Employment;
  pfAccount: PFAccount;
  claim: ClaimEntity;
};

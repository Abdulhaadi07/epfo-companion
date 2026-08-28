import { describe, expect, it } from "vitest";
import { CLAIM_REASON_CODES, CLAIM_STATUSES } from "../domain/claims";
import { claimEventTypes, claimStatusEnum, claims, claimTypeEnum, employmentRecords, pfAccounts, users, claimEvents, READINESS_STATUSES, readinessStatusEnum } from "./schema";

describe("persistence schema", () => {
  it("uses the domain claim status vocabulary without database transition rules", () => {
    expect(claimStatusEnum.enumValues).toEqual(CLAIM_STATUSES);
    expect(claimTypeEnum.enumValues).toEqual(["FINAL_SETTLEMENT"]);
    expect(claimEventTypes).toContain("VERIFICATION_STARTED");
    expect(claimEvents.eventType).toBeDefined();
    expect(claimEventTypes).toEqual([
      "CLAIM_MARKED_READY", "CLAIM_SUBMITTED", "VERIFICATION_STARTED", "ACTION_REQUIRED",
      "CLAIM_REJECTED", "CLAIM_RESOLVED", "CLAIM_RESUBMITTED", "CLAIM_APPROVED",
      "SETTLEMENT_STARTED", "SETTLEMENT_COMPLETED",
    ]);
  });

  it("defines the complete relational table set and reason vocabulary", () => {
    expect(Object.keys({ users, employmentRecords, pfAccounts, claims, claimEvents })).toEqual([
      "users", "employmentRecords", "pfAccounts", "claims", "claimEvents",
    ]);
    expect(claimEvents.reasonCode).toBeDefined();
    expect(CLAIM_REASON_CODES).toContain("KYC_INCOMPLETE");
    expect(readinessStatusEnum.enumValues).toEqual(READINESS_STATUSES);
    expect(users.identityStatus).toBeDefined();
    expect(pfAccounts.bankStatus).toBeDefined();
    expect(pfAccounts.kycStatus).toBeDefined();
  });

  it("defines every claim event persistence field", () => {
    expect({
      id: claimEvents.id,
      claimId: claimEvents.claimId,
      eventType: claimEvents.eventType,
      reasonCode: claimEvents.reasonCode,
      occurredAt: claimEvents.occurredAt,
      metadata: claimEvents.metadata,
    }).toEqual(expect.objectContaining({
      id: expect.anything(), claimId: expect.anything(), eventType: expect.anything(),
      reasonCode: expect.anything(), occurredAt: expect.anything(), metadata: expect.anything(),
    }));
  });
});

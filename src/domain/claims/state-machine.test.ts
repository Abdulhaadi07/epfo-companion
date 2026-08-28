import { describe, expect, it } from "vitest";
import { createClaim, getAllowedClaimActions, InvalidClaimTransitionError, transitionClaim } from "./index";

const date = "2026-01-01T00:00:00.000Z";
const eventDate = "2026-01-02T00:00:00.000Z";
function readyClaim() { return transitionClaim(createClaim({ id: "claim-1", citizenId: "citizen-1", createdAt: date }), { type: "CLAIM_MARKED_READY" }, eventDate); }
function verificationClaim() { return transitionClaim(readyClaim(), { type: "CLAIM_SUBMITTED" }, eventDate); }

describe("claim state machine", () => {
  it("moves through the valid happy path", () => {
    let claim = transitionClaim(verificationClaim(), { type: "VERIFICATION_STARTED" }, eventDate);
    claim = transitionClaim(claim, { type: "CLAIM_APPROVED" }, eventDate);
    claim = transitionClaim(claim, { type: "SETTLEMENT_STARTED" }, eventDate);
    claim = transitionClaim(claim, { type: "SETTLEMENT_COMPLETED" }, eventDate);
    expect(claim.status).toBe("SETTLED"); expect(claim.timeline).toHaveLength(6);
  });
  it("rejects invalid transitions", () => {
    const claim = createClaim({ id: "claim-1", citizenId: "citizen-1", createdAt: date });
    expect(() => transitionClaim(claim, { type: "SETTLEMENT_STARTED" }, eventDate)).toThrow(InvalidClaimTransitionError);
  });
  it("does not allow settlement before approval", () => {
    expect(() => transitionClaim(verificationClaim(), { type: "SETTLEMENT_STARTED" }, eventDate)).toThrow(InvalidClaimTransitionError);
  });
  it("supports action-required recovery", () => {
    let claim = transitionClaim(verificationClaim(), { type: "VERIFICATION_STARTED" }, eventDate);
    claim = transitionClaim(claim, { type: "ACTION_REQUIRED", reasonCode: "BANK_NAME_MISMATCH" }, eventDate);
    expect(getAllowedClaimActions(claim)).toEqual(["UPDATE_BANK_DETAILS"]);
    expect(() => transitionClaim(claim, { type: "CLAIM_RESUBMITTED" }, eventDate)).toThrow(InvalidClaimTransitionError);
    claim = transitionClaim(claim, { type: "CLAIM_RESOLVED" }, eventDate);
    expect(claim.status).toBe("RESOLUTION");
    claim = transitionClaim(claim, { type: "CLAIM_RESUBMITTED" }, eventDate);
    expect(claim.status).toBe("RESUBMITTED"); expect(claim.reasonCodes).toEqual([]);
  });
  it("supports rejected recovery", () => {
    let claim = transitionClaim(verificationClaim(), { type: "VERIFICATION_STARTED" }, eventDate);
    claim = transitionClaim(claim, { type: "CLAIM_REJECTED", reasonCode: "KYC_INCOMPLETE" }, eventDate);
    expect(getAllowedClaimActions(claim)).toContain("COMPLETE_KYC"); expect(getAllowedClaimActions(claim)).toContain("VIEW_REJECTION_REASON");
    expect(() => transitionClaim(claim, { type: "CLAIM_RESUBMITTED" }, eventDate)).toThrow(InvalidClaimTransitionError);
    claim = transitionClaim(claim, { type: "CLAIM_RESOLVED" }, eventDate);
    expect(claim.status).toBe("RESOLUTION");
    claim = transitionClaim(claim, { type: "CLAIM_RESUBMITTED" }, eventDate);
    claim = transitionClaim(claim, { type: "VERIFICATION_STARTED" }, eventDate);
    expect(claim.status).toBe("UNDER_VERIFICATION");
  });
  it("derives actions for passive states", () => {
    expect(getAllowedClaimActions(createClaim({ id: "claim-1", citizenId: "citizen-1", createdAt: date }))).toEqual(["COMPLETE_READINESS"]);
    expect(getAllowedClaimActions({ status: "UNDER_VERIFICATION", reasonCodes: [] })).toEqual(["VIEW_STATUS"]);
  });
});

import { claimDomainEventSchema } from "./schema";
import type { ClaimDomainEvent, ClaimEntity, ClaimReasonCode, ClaimStatus, ClaimTimelineEvent, CreateClaimInput } from "./types";

export class InvalidClaimTransitionError extends Error {
  constructor(public readonly status: ClaimStatus, public readonly event: ClaimDomainEvent["type"]) {
    super(`Cannot apply ${event} while claim is ${status}.`);
    this.name = "InvalidClaimTransitionError";
  }
}

const transitions: Record<ClaimStatus, Partial<Record<ClaimDomainEvent["type"], ClaimStatus>>> = {
  DRAFT: { CLAIM_MARKED_READY: "READY" }, READY: { CLAIM_SUBMITTED: "SUBMITTED" },
  SUBMITTED: { VERIFICATION_STARTED: "UNDER_VERIFICATION" },
  UNDER_VERIFICATION: { ACTION_REQUIRED: "ACTION_REQUIRED", CLAIM_REJECTED: "REJECTED", CLAIM_APPROVED: "APPROVED" },
  ACTION_REQUIRED: { CLAIM_RESOLVED: "RESOLUTION" }, REJECTED: { CLAIM_RESOLVED: "RESOLUTION" },
  RESOLUTION: { CLAIM_RESUBMITTED: "RESUBMITTED" },
  RESUBMITTED: { VERIFICATION_STARTED: "UNDER_VERIFICATION" },
  APPROVED: { SETTLEMENT_STARTED: "SETTLEMENT" }, SETTLEMENT: { SETTLEMENT_COMPLETED: "SETTLED" }, SETTLED: {},
};

export function createClaim(input: CreateClaimInput): ClaimEntity {
  const timestamp = input.createdAt ?? new Date().toISOString();
  return { id: input.id, type: "FINAL_SETTLEMENT", citizenId: input.citizenId, status: "DRAFT", reasonCodes: [], createdAt: timestamp, updatedAt: timestamp, timeline: [] };
}

export function transitionClaim(claim: ClaimEntity, event: ClaimDomainEvent, occurredAt = new Date().toISOString()): ClaimEntity {
  const parsedEvent = claimDomainEventSchema.parse(event);
  const nextStatus = transitions[claim.status][parsedEvent.type];
  if (!nextStatus) throw new InvalidClaimTransitionError(claim.status, parsedEvent.type);
  const reasonCodes = getReasonCodes(parsedEvent.type, "reasonCode" in parsedEvent ? parsedEvent.reasonCode : undefined);
  const timelineEvent: ClaimTimelineEvent = { ...parsedEvent, id: `${claim.id}-${claim.timeline.length + 1}`, occurredAt };
  return { ...claim, status: nextStatus, reasonCodes, updatedAt: occurredAt, timeline: [...claim.timeline, timelineEvent] };
}

function getReasonCodes(eventType: ClaimDomainEvent["type"], reasonCode?: ClaimReasonCode): readonly ClaimReasonCode[] {
  if (eventType === "ACTION_REQUIRED") return reasonCode ? [reasonCode] : [];
  if (eventType === "CLAIM_REJECTED") return [reasonCode ?? "CLAIM_REJECTED"];
  return [];
}

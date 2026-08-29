import type { ClaimEntity, ClaimReasonCode, ClaimTimelineEvent } from "@/domain/claims";
import type { ClaimEventRecord, ClaimRecord } from "@/repositories";

function toTimelineEvent(event: ClaimEventRecord): ClaimTimelineEvent {
  const base = {
    id: event.id,
    occurredAt: event.occurredAt.toISOString(),
  };

  switch (event.eventType) {
    case "ACTION_REQUIRED":
      return {
        ...base,
        type: event.eventType,
        reasonCode: (event.reasonCode ?? "CLAIM_REJECTED") as ClaimReasonCode,
      };
    case "CLAIM_REJECTED":
      return {
        ...base,
        type: event.eventType,
        ...(event.reasonCode ? { reasonCode: event.reasonCode as ClaimReasonCode } : {}),
      };
    default:
      return { ...base, type: event.eventType };
  }
}

export function toClaimEntity(claim: ClaimRecord, events: readonly ClaimEventRecord[]): ClaimEntity {
  return {
    id: claim.id,
    type: claim.claimType,
    citizenId: claim.userId,
    status: claim.currentStatus,
    reasonCodes: claim.reasonCodes,
    createdAt: claim.createdAt.toISOString(),
    updatedAt: claim.updatedAt.toISOString(),
    timeline: events.map(toTimelineEvent),
  };
}

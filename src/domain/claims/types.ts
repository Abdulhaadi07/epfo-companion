export const CLAIM_STATUSES = [
  "DRAFT", "READY", "SUBMITTED", "UNDER_VERIFICATION", "ACTION_REQUIRED",
  "REJECTED", "RESOLUTION", "RESUBMITTED", "APPROVED", "SETTLEMENT", "SETTLED",
] as const;

export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const CLAIM_REASON_CODES = [
  "BANK_NAME_MISMATCH", "BANK_NOT_VERIFIED", "EXIT_DATE_MISSING", "KYC_INCOMPLETE",
  "IDENTITY_MISMATCH", "DOCUMENT_REQUIRED", "CLAIM_REJECTED",
] as const;

export type ClaimReasonCode = (typeof CLAIM_REASON_CODES)[number];
export type ClaimType = "FINAL_SETTLEMENT";

export const CLAIM_ACTIONS = [
  "COMPLETE_READINESS", "SUBMIT_CLAIM", "VIEW_STATUS", "UPDATE_BANK_DETAILS",
  "VERIFY_BANK_ACCOUNT", "ADD_EXIT_DATE", "COMPLETE_KYC", "VERIFY_IDENTITY",
  "UPLOAD_DOCUMENT", "VIEW_REJECTION_REASON", "FIX_CLAIM", "RESUBMIT_CLAIM",
  "VIEW_APPROVAL", "TRACK_SETTLEMENT", "VIEW_SETTLEMENT",
] as const;

export type ClaimAction = (typeof CLAIM_ACTIONS)[number];

export type ClaimDomainEvent =
  | { type: "CLAIM_MARKED_READY" }
  | { type: "CLAIM_SUBMITTED" }
  | { type: "VERIFICATION_STARTED" }
  | { type: "ACTION_REQUIRED"; reasonCode: ClaimReasonCode }
  | { type: "CLAIM_REJECTED"; reasonCode?: ClaimReasonCode }
  | { type: "CLAIM_RESOLVED" }
  | { type: "CLAIM_RESUBMITTED" }
  | { type: "CLAIM_APPROVED" }
  | { type: "SETTLEMENT_STARTED" }
  | { type: "SETTLEMENT_COMPLETED" };

export type ClaimTimelineEvent = ClaimDomainEvent & { id: string; occurredAt: string };

export type ClaimEntity = {
  id: string;
  type: ClaimType;
  citizenId: string;
  status: ClaimStatus;
  reasonCodes: readonly ClaimReasonCode[];
  createdAt: string;
  updatedAt: string;
  timeline: readonly ClaimTimelineEvent[];
};

export type CreateClaimInput = { id: string; citizenId: string; createdAt?: string };

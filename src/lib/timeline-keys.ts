import type { ClaimDomainEvent, ClaimReasonCode } from "@/domain/claims";
import type { TranslationKey } from "@/i18n/keys";

export const TIMELINE_EVENT_LABEL_KEYS: Record<ClaimDomainEvent["type"], TranslationKey> = {
  CLAIM_MARKED_READY: "timeline.event.claimMarkedReady",
  CLAIM_SUBMITTED: "timeline.event.claimSubmitted",
  VERIFICATION_STARTED: "timeline.event.verificationStarted",
  ACTION_REQUIRED: "timeline.event.actionRequired",
  CLAIM_REJECTED: "timeline.event.claimRejected",
  CLAIM_RESOLVED: "timeline.event.claimResolved",
  CLAIM_RESUBMITTED: "timeline.event.claimResubmitted",
  CLAIM_APPROVED: "timeline.event.claimApproved",
  SETTLEMENT_STARTED: "timeline.event.settlementStarted",
  SETTLEMENT_COMPLETED: "timeline.event.settlementCompleted",
};

export const TIMELINE_REASON_EVENT_LABEL_KEYS: Partial<Record<ClaimReasonCode, TranslationKey>> = {
  BANK_NAME_MISMATCH: "timeline.reason.bankAccountMismatch",
  BANK_NOT_VERIFIED: "timeline.reason.bankNotVerified",
  EXIT_DATE_MISSING: "timeline.reason.exitDateMissing",
  KYC_INCOMPLETE: "timeline.reason.kycIncomplete",
  IDENTITY_MISMATCH: "timeline.reason.identityMismatch",
  DOCUMENT_REQUIRED: "timeline.reason.documentRequired",
  CLAIM_REJECTED: "timeline.reason.claimRejected",
};

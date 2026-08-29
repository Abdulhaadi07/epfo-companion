import type { ClaimAction, ClaimReasonCode, ClaimStatus } from "@/domain/claims";
import type { TranslationKey } from "@/i18n/keys";

export const CLAIM_STATUS_LABEL_KEYS: Record<ClaimStatus, TranslationKey> = {
  DRAFT: "claim.presentation.draft.label",
  READY: "claim.status.ready",
  SUBMITTED: "claim.status.received",
  UNDER_VERIFICATION: "claim.status.underVerification",
  ACTION_REQUIRED: "claim.status.actionRequired",
  REJECTED: "claim.status.rejected",
  RESOLUTION: "claim.presentation.resolution.label",
  RESUBMITTED: "claim.presentation.resubmitted.label",
  APPROVED: "claim.status.approved",
  SETTLEMENT: "claim.status.beingSettled",
  SETTLED: "claim.status.settled",
};

export const CLAIM_STATUS_PRESENTATION_KEYS: Record<
  ClaimStatus,
  {
    situation: TranslationKey;
    actionMessage: TranslationKey;
    nextStep: TranslationKey;
    readinessSummary: TranslationKey;
    defaultAction: TranslationKey;
  }
> = {
  DRAFT: {
    situation: "claim.presentation.draft.situation",
    actionMessage: "claim.presentation.draft.actionMessage",
    nextStep: "claim.presentation.draft.nextStep",
    readinessSummary: "claim.presentation.draft.readinessSummary",
    defaultAction: "claim.action.getReady",
  },
  READY: {
    situation: "claim.presentation.ready.situation",
    actionMessage: "claim.presentation.ready.actionMessage",
    nextStep: "claim.presentation.ready.nextStep",
    readinessSummary: "claim.presentation.ready.readinessSummary",
    defaultAction: "claim.action.start",
  },
  SUBMITTED: {
    situation: "claim.presentation.submitted.situation",
    actionMessage: "claim.presentation.submitted.actionMessage",
    nextStep: "claim.presentation.submitted.nextStep",
    readinessSummary: "claim.presentation.submitted.readinessSummary",
    defaultAction: "claim.action.viewClaim",
  },
  UNDER_VERIFICATION: {
    situation: "claim.presentation.underVerification.situation",
    actionMessage: "claim.presentation.underVerification.actionMessage",
    nextStep: "claim.presentation.underVerification.nextStep",
    readinessSummary: "claim.presentation.underVerification.readinessSummary",
    defaultAction: "claim.action.viewStatus",
  },
  ACTION_REQUIRED: {
    situation: "claim.presentation.actionRequired.situation",
    actionMessage: "claim.presentation.actionRequired.actionMessage",
    nextStep: "claim.presentation.actionRequired.nextStep",
    readinessSummary: "claim.presentation.actionRequired.readinessSummary",
    defaultAction: "claim.action.fixProblem",
  },
  REJECTED: {
    situation: "claim.presentation.rejected.situation",
    actionMessage: "claim.presentation.rejected.actionMessage",
    nextStep: "claim.presentation.rejected.nextStep",
    readinessSummary: "claim.presentation.rejected.readinessSummary",
    defaultAction: "claim.action.understandProblem",
  },
  RESOLUTION: {
    situation: "claim.presentation.resolution.situation",
    actionMessage: "claim.presentation.resolution.actionMessage",
    nextStep: "claim.presentation.resolution.nextStep",
    readinessSummary: "claim.presentation.resolution.readinessSummary",
    defaultAction: "claim.action.continueFix",
  },
  RESUBMITTED: {
    situation: "claim.presentation.resubmitted.situation",
    actionMessage: "claim.presentation.resubmitted.actionMessage",
    nextStep: "claim.presentation.resubmitted.nextStep",
    readinessSummary: "claim.presentation.resubmitted.readinessSummary",
    defaultAction: "claim.action.viewClaim",
  },
  APPROVED: {
    situation: "claim.presentation.approved.situation",
    actionMessage: "claim.presentation.approved.actionMessage",
    nextStep: "claim.presentation.approved.nextStep",
    readinessSummary: "claim.presentation.approved.readinessSummary",
    defaultAction: "claim.action.viewClaim",
  },
  SETTLEMENT: {
    situation: "claim.presentation.settlement.situation",
    actionMessage: "claim.presentation.settlement.actionMessage",
    nextStep: "claim.presentation.settlement.nextStep",
    readinessSummary: "claim.presentation.settlement.readinessSummary",
    defaultAction: "claim.action.viewClaim",
  },
  SETTLED: {
    situation: "claim.presentation.settled.situation",
    actionMessage: "claim.presentation.settled.actionMessage",
    nextStep: "claim.presentation.settled.nextStep",
    readinessSummary: "claim.presentation.settled.readinessSummary",
    defaultAction: "claim.action.viewClaim",
  },
};

export const CLAIM_REASON_SUMMARY_KEYS: Record<ClaimReasonCode, TranslationKey> = {
  BANK_NAME_MISMATCH: "claim.reason.bankAccountMismatch",
  BANK_NOT_VERIFIED: "claim.reason.bankNotVerified",
  EXIT_DATE_MISSING: "claim.reason.exitDateMissing",
  KYC_INCOMPLETE: "claim.reason.kycIncomplete",
  IDENTITY_MISMATCH: "claim.reason.identityMismatch",
  DOCUMENT_REQUIRED: "claim.reason.documentRequired",
  CLAIM_REJECTED: "claim.reason.claimRejected",
};

export const CLAIM_REASON_SITUATION_OVERRIDE_KEYS: Partial<
  Record<ClaimStatus, Partial<Record<ClaimReasonCode, TranslationKey>>>
> = {
  ACTION_REQUIRED: {
    BANK_NAME_MISMATCH: "claim.presentation.situation.actionRequired.bankAccountMismatch",
    BANK_NOT_VERIFIED: "claim.presentation.situation.actionRequired.bankNotVerified",
    EXIT_DATE_MISSING: "claim.presentation.situation.actionRequired.exitDateMissing",
    KYC_INCOMPLETE: "claim.presentation.situation.actionRequired.kycIncomplete",
    IDENTITY_MISMATCH: "claim.presentation.situation.actionRequired.identityMismatch",
    DOCUMENT_REQUIRED: "claim.presentation.situation.actionRequired.documentRequired",
  },
  REJECTED: {
    KYC_INCOMPLETE: "claim.presentation.situation.rejected.kycIncomplete",
    BANK_NAME_MISMATCH: "claim.presentation.situation.rejected.bankAccountMismatch",
    BANK_NOT_VERIFIED: "claim.presentation.situation.rejected.bankNotVerified",
    EXIT_DATE_MISSING: "claim.presentation.situation.rejected.exitDateMissing",
    IDENTITY_MISMATCH: "claim.presentation.situation.rejected.identityMismatch",
    DOCUMENT_REQUIRED: "claim.presentation.situation.rejected.documentRequired",
    CLAIM_REJECTED: "claim.presentation.situation.rejected.claimRejected",
  },
};

export const CLAIM_REASON_NEXT_STEP_OVERRIDE_KEYS: Partial<
  Record<ClaimStatus, Partial<Record<ClaimReasonCode, TranslationKey>>>
> = {
  ACTION_REQUIRED: {
    BANK_NAME_MISMATCH: "claim.presentation.nextStep.actionRequired.bankAccountMismatch",
    KYC_INCOMPLETE: "claim.presentation.nextStep.actionRequired.kycIncomplete",
  },
  REJECTED: {
    KYC_INCOMPLETE: "claim.presentation.nextStep.rejected.kycIncomplete",
    BANK_NAME_MISMATCH: "claim.presentation.nextStep.rejected.bankAccountMismatch",
  },
};

export const CLAIM_ACTION_LABEL_KEYS: Record<ClaimAction, TranslationKey> = {
  COMPLETE_READINESS: "claim.action.getReady",
  SUBMIT_CLAIM: "claim.action.start",
  VIEW_STATUS: "claim.action.viewStatus",
  UPDATE_BANK_DETAILS: "claim.action.updateBankDetails",
  VERIFY_BANK_ACCOUNT: "claim.action.verifyBankAccount",
  ADD_EXIT_DATE: "claim.action.addExitDate",
  COMPLETE_KYC: "claim.action.completeKyc",
  VERIFY_IDENTITY: "claim.action.verifyIdentity",
  UPLOAD_DOCUMENT: "claim.action.uploadDocument",
  VIEW_REJECTION_REASON: "claim.action.understandProblem",
  FIX_CLAIM: "claim.action.fixProblem",
  RESUBMIT_CLAIM: "claim.action.continueFix",
  VIEW_APPROVAL: "claim.action.viewClaim",
  TRACK_SETTLEMENT: "claim.action.viewClaim",
  VIEW_SETTLEMENT: "claim.action.viewClaim",
};

export const CLAIM_ACTION_REQUIRED_STATUSES = new Set<ClaimStatus>([
  "DRAFT",
  "READY",
  "ACTION_REQUIRED",
  "REJECTED",
  "RESOLUTION",
]);

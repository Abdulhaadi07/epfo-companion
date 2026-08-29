import { getAllowedClaimActions, type ClaimAction, type ClaimReasonCode, type ClaimStatus } from "@/domain/claims";
import type { TranslationKey } from "@/i18n/keys";
import type { Translator } from "@/i18n/server";
import { translate } from "@/i18n/translate";
import type { StatusSeverity } from "@/components/ui/status-badge";
import {
  CLAIM_ACTION_LABEL_KEYS,
  CLAIM_ACTION_REQUIRED_STATUSES,
  CLAIM_REASON_NEXT_STEP_OVERRIDE_KEYS,
  CLAIM_REASON_SITUATION_OVERRIDE_KEYS,
  CLAIM_REASON_SUMMARY_KEYS,
  CLAIM_STATUS_LABEL_KEYS,
  CLAIM_STATUS_PRESENTATION_KEYS,
} from "./claim-presentation-keys";

export type ClaimPresentation = {
  label: string;
  severity: StatusSeverity;
  situation: string;
  actionRequired: boolean;
  actionMessage: string;
  nextStep: string;
  actionLabel: string;
  actionHref: string;
  readinessSummary: string;
};

export type ClaimPresentationModel = {
  labelKey: TranslationKey;
  severity: StatusSeverity;
  situationKey: TranslationKey;
  actionRequired: boolean;
  actionMessageKey: TranslationKey;
  nextStepKey: TranslationKey;
  actionLabelKey: TranslationKey;
  actionHref: string;
  readinessSummaryKey: TranslationKey;
};

export type ClaimPresentationInput = {
  status: ClaimStatus;
  reasonCodes: readonly ClaimReasonCode[];
  allowedActions?: readonly ClaimAction[];
};

const statusSeverity: Record<ClaimStatus, StatusSeverity> = {
  DRAFT: "neutral",
  READY: "success",
  SUBMITTED: "info",
  UNDER_VERIFICATION: "info",
  ACTION_REQUIRED: "warning",
  REJECTED: "danger",
  RESOLUTION: "warning",
  RESUBMITTED: "info",
  APPROVED: "success",
  SETTLEMENT: "info",
  SETTLED: "success",
};

const defaultActionHrefs: Record<ClaimStatus, string> = {
  DRAFT: "/claim/start",
  READY: "/claim/start",
  SUBMITTED: "/claim/status",
  UNDER_VERIFICATION: "/claim/status",
  ACTION_REQUIRED: "/claim/status",
  REJECTED: "/claim/status",
  RESOLUTION: "/claim/status",
  RESUBMITTED: "/claim/status",
  APPROVED: "/claim/status",
  SETTLEMENT: "/claim/status",
  SETTLED: "/claim/status",
};

const actionHrefs: Record<ClaimAction, string> = {
  COMPLETE_READINESS: "/claim/start",
  SUBMIT_CLAIM: "/claim/start",
  VIEW_STATUS: "/claim/status",
  UPDATE_BANK_DETAILS: "/claim/status",
  VERIFY_BANK_ACCOUNT: "/claim/status",
  ADD_EXIT_DATE: "/claim/status",
  COMPLETE_KYC: "/claim/status",
  VERIFY_IDENTITY: "/claim/status",
  UPLOAD_DOCUMENT: "/claim/status",
  VIEW_REJECTION_REASON: "/claim/status",
  FIX_CLAIM: "/claim/status",
  RESUBMIT_CLAIM: "/claim/status",
  VIEW_APPROVAL: "/claim/status",
  TRACK_SETTLEMENT: "/claim/status",
  VIEW_SETTLEMENT: "/claim/status",
};

const informationalActions = new Set<ClaimAction>([
  "VIEW_STATUS",
  "VIEW_REJECTION_REASON",
  "VIEW_APPROVAL",
  "TRACK_SETTLEMENT",
  "VIEW_SETTLEMENT",
]);

function selectPrimaryAction(allowedActions: readonly ClaimAction[]): ClaimAction | undefined {
  return allowedActions.find((action) => !informationalActions.has(action)) ?? allowedActions[0];
}

export function getReasonSummaryKeys(reasonCodes: readonly ClaimReasonCode[]): readonly TranslationKey[] {
  return reasonCodes.map((reasonCode) => CLAIM_REASON_SUMMARY_KEYS[reasonCode]);
}

export function buildClaimPresentation(input: ClaimPresentationInput): ClaimPresentationModel {
  const presentationKeys = CLAIM_STATUS_PRESENTATION_KEYS[input.status];
  const allowedActions = input.allowedActions ?? getAllowedClaimActions({
    status: input.status,
    reasonCodes: input.reasonCodes,
  });
  const primaryReason = input.reasonCodes[0];
  const situationOverride = primaryReason
    ? CLAIM_REASON_SITUATION_OVERRIDE_KEYS[input.status]?.[primaryReason]
    : undefined;
  const nextStepOverride = primaryReason
    ? CLAIM_REASON_NEXT_STEP_OVERRIDE_KEYS[input.status]?.[primaryReason]
    : undefined;
  const primaryAction = selectPrimaryAction(allowedActions);

  return {
    labelKey: CLAIM_STATUS_LABEL_KEYS[input.status],
    severity: statusSeverity[input.status],
    situationKey: situationOverride ?? presentationKeys.situation,
    actionRequired: CLAIM_ACTION_REQUIRED_STATUSES.has(input.status),
    actionMessageKey: presentationKeys.actionMessage,
    nextStepKey: nextStepOverride ?? presentationKeys.nextStep,
    actionLabelKey: primaryAction ? CLAIM_ACTION_LABEL_KEYS[primaryAction] : presentationKeys.defaultAction,
    actionHref: primaryAction ? actionHrefs[primaryAction] : defaultActionHrefs[input.status],
    readinessSummaryKey: presentationKeys.readinessSummary,
  };
}

export function localizeClaimPresentation(t: Translator, model: ClaimPresentationModel): ClaimPresentation {
  return {
    label: t(model.labelKey),
    severity: model.severity,
    situation: t(model.situationKey),
    actionRequired: model.actionRequired,
    actionMessage: t(model.actionMessageKey),
    nextStep: t(model.nextStepKey),
    actionLabel: t(model.actionLabelKey),
    actionHref: model.actionHref,
    readinessSummary: t(model.readinessSummaryKey),
  };
}

export function localizeReasonSummaries(
  t: Translator,
  keys: readonly TranslationKey[],
): readonly string[] {
  return keys.map((key) => t(key));
}

export function getClaimPresentation(status: ClaimStatus): ClaimPresentation {
  return localizeClaimPresentation(
    (key) => translate("en", key),
    buildClaimPresentation({ status, reasonCodes: [] }),
  );
}

export function getReasonSummaries(reasonCodes: readonly ClaimReasonCode[]): readonly string[] {
  return localizeReasonSummaries(
    (key) => translate("en", key),
    getReasonSummaryKeys(reasonCodes),
  );
}

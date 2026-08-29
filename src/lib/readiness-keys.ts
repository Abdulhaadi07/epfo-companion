import type { TranslationKey } from "@/i18n/keys";
import type { ReadinessDimensionStatus } from "@/application/readiness";

export const READINESS_DIMENSION_NAME_KEYS = {
  identity: "account.identity",
  bank: "account.bankDetails",
  kyc: "account.kyc",
} as const satisfies Record<"identity" | "bank" | "kyc", TranslationKey>;

export const READINESS_STATUS_MESSAGE_KEYS: Record<ReadinessDimensionStatus, TranslationKey> = {
  READY: "readiness.ready",
  UNDER_VERIFICATION: "readiness.beingChecked",
  ACTION_REQUIRED: "readiness.needsAttention",
  REJECTED: "readiness.couldNotBeCompleted",
};

export const READINESS_DISPLAY_LABEL_KEYS: Record<
  keyof typeof READINESS_DIMENSION_NAME_KEYS,
  Record<ReadinessDimensionStatus, TranslationKey>
> = {
  identity: {
    READY: "readiness.identityVerified",
    UNDER_VERIFICATION: "readiness.identityBeingVerified",
    ACTION_REQUIRED: "readiness.identityNeedsAttention",
    REJECTED: "readiness.identityCouldNotBeVerified",
  },
  bank: {
    READY: "readiness.bankReady",
    UNDER_VERIFICATION: "readiness.bankBeingVerified",
    ACTION_REQUIRED: "readiness.bankNeedsAttention",
    REJECTED: "readiness.bankCouldNotBeVerified",
  },
  kyc: {
    READY: "readiness.kycComplete",
    UNDER_VERIFICATION: "readiness.kycBeingVerified",
    ACTION_REQUIRED: "readiness.kycNeedsAttention",
    REJECTED: "readiness.kycCouldNotBeCompleted",
  },
};

export function resolveReadinessOverallLabelKey(
  dimensions: readonly { status: ReadinessDimensionStatus }[],
): TranslationKey {
  if (dimensions.some((dimension) => dimension.status === "ACTION_REQUIRED")) {
    return "readiness.detailsNeedAttention";
  }
  if (dimensions.some((dimension) => dimension.status === "REJECTED")) {
    return "readiness.checksCouldNotBeCompleted";
  }
  if (dimensions.some((dimension) => dimension.status === "UNDER_VERIFICATION")) {
    return "readiness.checksInProgress";
  }
  return "readiness.readyToProceed";
}

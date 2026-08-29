import type { TranslationKey } from "@/i18n/keys";
import {
  READINESS_DIMENSION_NAME_KEYS,
  READINESS_DISPLAY_LABEL_KEYS,
  READINESS_STATUS_MESSAGE_KEYS,
  resolveReadinessOverallLabelKey,
} from "@/lib/readiness-keys";

export const READINESS_DIMENSION_STATUSES = [
  "READY",
  "UNDER_VERIFICATION",
  "ACTION_REQUIRED",
  "REJECTED",
] as const;

export type ReadinessDimensionStatus = (typeof READINESS_DIMENSION_STATUSES)[number];

export type ReadinessDimensionView = {
  key: "identity" | "bank" | "kyc";
  labelKey: TranslationKey;
  status: ReadinessDimensionStatus;
  citizenMessageKey: TranslationKey;
  displayLabelKey: TranslationKey;
};

export type CitizenHomeReadinessView = {
  overallLabelKey: TranslationKey;
  actionRequired: boolean;
  dimensions: readonly ReadinessDimensionView[];
};

export function assembleReadiness(input: {
  identityStatus: ReadinessDimensionStatus;
  bankStatus: ReadinessDimensionStatus;
  kycStatus: ReadinessDimensionStatus;
}): CitizenHomeReadinessView {
  const dimensions: ReadinessDimensionView[] = [
    {
      key: "identity",
      labelKey: READINESS_DIMENSION_NAME_KEYS.identity,
      status: input.identityStatus,
      citizenMessageKey: READINESS_STATUS_MESSAGE_KEYS[input.identityStatus],
      displayLabelKey: READINESS_DISPLAY_LABEL_KEYS.identity[input.identityStatus],
    },
    {
      key: "bank",
      labelKey: READINESS_DIMENSION_NAME_KEYS.bank,
      status: input.bankStatus,
      citizenMessageKey: READINESS_STATUS_MESSAGE_KEYS[input.bankStatus],
      displayLabelKey: READINESS_DISPLAY_LABEL_KEYS.bank[input.bankStatus],
    },
    {
      key: "kyc",
      labelKey: READINESS_DIMENSION_NAME_KEYS.kyc,
      status: input.kycStatus,
      citizenMessageKey: READINESS_STATUS_MESSAGE_KEYS[input.kycStatus],
      displayLabelKey: READINESS_DISPLAY_LABEL_KEYS.kyc[input.kycStatus],
    },
  ];

  return {
    overallLabelKey: resolveReadinessOverallLabelKey(dimensions),
    actionRequired: dimensions.some(
      (dimension) => dimension.status === "ACTION_REQUIRED" || dimension.status === "REJECTED",
    ),
    dimensions,
  };
}

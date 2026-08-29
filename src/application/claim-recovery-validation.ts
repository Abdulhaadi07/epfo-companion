import type { ClaimReasonCode } from "@/domain/claims";
import type { EmploymentRecord, PFAccountRecord } from "@/repositories";

export type BankNameMismatchCorrection = {
  reasonCode: "BANK_NAME_MISMATCH";
  bankDisplayName: string;
};

export type BankNotVerifiedCorrection = {
  reasonCode: "BANK_NOT_VERIFIED";
};

export type ExitDateMissingCorrection = {
  reasonCode: "EXIT_DATE_MISSING";
  employmentEndDate: string;
};

export type KycIncompleteCorrection = {
  reasonCode: "KYC_INCOMPLETE";
};

export type IdentityMismatchCorrection = {
  reasonCode: "IDENTITY_MISMATCH";
};

export type DocumentRequiredCorrection = {
  reasonCode: "DOCUMENT_REQUIRED";
};

export type ClaimRejectedCorrection = {
  reasonCode: "CLAIM_REJECTED";
};

export type ClaimRecoveryCorrection =
  | BankNameMismatchCorrection
  | BankNotVerifiedCorrection
  | ExitDateMissingCorrection
  | KycIncompleteCorrection
  | IdentityMismatchCorrection
  | DocumentRequiredCorrection
  | ClaimRejectedCorrection;

export type ClaimRecoveryInput = {
  corrections: readonly ClaimRecoveryCorrection[];
};

export type ClaimRecoveryValidationErrorCode =
  | "EMPTY_CORRECTIONS"
  | "UNKNOWN_REASON_CODE"
  | "DUPLICATE_REASON_CODE"
  | "INVALID_BANK_DISPLAY_NAME"
  | "INVALID_EMPLOYMENT_END_DATE"
  | "EMPLOYMENT_END_BEFORE_START";

export type ClaimRecoveryValidationResult =
  | { valid: true; resolvedReasonCodes: readonly ClaimReasonCode[] }
  | { valid: false; code: ClaimRecoveryValidationErrorCode };

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateClaimRecoveryInput(
  reasonCodes: readonly ClaimReasonCode[],
  input: ClaimRecoveryInput,
  context: {
    pfAccount: PFAccountRecord;
    employment: EmploymentRecord;
  },
): ClaimRecoveryValidationResult {
  if (input.corrections.length === 0) {
    return { valid: false, code: "EMPTY_CORRECTIONS" };
  }

  const resolvedReasonCodes: ClaimReasonCode[] = [];
  const seen = new Set<ClaimReasonCode>();

  for (const correction of input.corrections) {
    if (!reasonCodes.includes(correction.reasonCode)) {
      return { valid: false, code: "UNKNOWN_REASON_CODE" };
    }

    if (seen.has(correction.reasonCode)) {
      return { valid: false, code: "DUPLICATE_REASON_CODE" };
    }
    seen.add(correction.reasonCode);

    const fieldValidation = validateCorrectionFields(correction, context);
    if (!fieldValidation.valid) {
      return fieldValidation;
    }

    resolvedReasonCodes.push(correction.reasonCode);
  }

  return { valid: true, resolvedReasonCodes };
}

function validateCorrectionFields(
  correction: ClaimRecoveryCorrection,
  context: {
    pfAccount: PFAccountRecord;
    employment: EmploymentRecord;
  },
): ClaimRecoveryValidationResult | { valid: true } {
  switch (correction.reasonCode) {
    case "BANK_NAME_MISMATCH": {
      const bankDisplayName = correction.bankDisplayName.trim();
      if (bankDisplayName.length < 2) {
        return { valid: false, code: "INVALID_BANK_DISPLAY_NAME" };
      }
      if (bankDisplayName === context.pfAccount.bankDisplayName.trim()) {
        return { valid: false, code: "INVALID_BANK_DISPLAY_NAME" };
      }
      return { valid: true };
    }
    case "EXIT_DATE_MISSING": {
      if (!ISO_DATE_PATTERN.test(correction.employmentEndDate)) {
        return { valid: false, code: "INVALID_EMPLOYMENT_END_DATE" };
      }
      if (correction.employmentEndDate < context.employment.startDate) {
        return { valid: false, code: "EMPLOYMENT_END_BEFORE_START" };
      }
      return { valid: true };
    }
    default:
      return { valid: true };
  }
}

export function remainingReasonCodes(
  currentReasonCodes: readonly ClaimReasonCode[],
  resolvedReasonCodes: readonly ClaimReasonCode[],
): ClaimReasonCode[] {
  const resolved = new Set(resolvedReasonCodes);
  return currentReasonCodes.filter((reasonCode) => !resolved.has(reasonCode));
}

import { describe, expect, it } from "vitest";
import {
  remainingReasonCodes,
  validateClaimRecoveryInput,
  type ClaimRecoveryInput,
} from "./claim-recovery-validation";
import type { EmploymentRecord, PFAccountRecord } from "@/repositories";

const pfAccount: PFAccountRecord = {
  id: "pf-1",
  userId: "user-1",
  employmentId: "employment-1",
  syntheticMemberId: "SYN-1",
  balanceInPaise: 1_000_000,
  bankDisplayName: "ICICI Bank",
  bankStatus: "ACTION_REQUIRED",
  kycStatus: "READY",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const employment: EmploymentRecord = {
  id: "employment-1",
  userId: "user-1",
  employerName: "Example Employer",
  startDate: "2020-01-01",
  endDate: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("validateClaimRecoveryInput", () => {
  it("accepts a valid bank name correction", () => {
    const input: ClaimRecoveryInput = {
      corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" }],
    };

    const result = validateClaimRecoveryInput(["BANK_NAME_MISMATCH"], input, { pfAccount, employment });

    expect(result).toEqual({ valid: true, resolvedReasonCodes: ["BANK_NAME_MISMATCH"] });
  });

  it("rejects empty corrections", () => {
    const result = validateClaimRecoveryInput(["BANK_NAME_MISMATCH"], { corrections: [] }, { pfAccount, employment });

    expect(result).toEqual({ valid: false, code: "EMPTY_CORRECTIONS" });
  });

  it("rejects unknown reason codes", () => {
    const input: ClaimRecoveryInput = {
      corrections: [{ reasonCode: "KYC_INCOMPLETE" }],
    };

    const result = validateClaimRecoveryInput(["BANK_NAME_MISMATCH"], input, { pfAccount, employment });

    expect(result).toEqual({ valid: false, code: "UNKNOWN_REASON_CODE" });
  });

  it("rejects duplicate reason codes", () => {
    const input: ClaimRecoveryInput = {
      corrections: [
        { reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" },
        { reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "HDFC Bank" },
      ],
    };

    const result = validateClaimRecoveryInput(["BANK_NAME_MISMATCH"], input, { pfAccount, employment });

    expect(result).toEqual({ valid: false, code: "DUPLICATE_REASON_CODE" });
  });

  it("rejects unchanged bank display names", () => {
    const input: ClaimRecoveryInput = {
      corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "ICICI Bank" }],
    };

    const result = validateClaimRecoveryInput(["BANK_NAME_MISMATCH"], input, { pfAccount, employment });

    expect(result).toEqual({ valid: false, code: "INVALID_BANK_DISPLAY_NAME" });
  });

  it("rejects invalid employment end dates", () => {
    const input: ClaimRecoveryInput = {
      corrections: [{ reasonCode: "EXIT_DATE_MISSING", employmentEndDate: "not-a-date" }],
    };

    const result = validateClaimRecoveryInput(["EXIT_DATE_MISSING"], input, { pfAccount, employment });

    expect(result).toEqual({ valid: false, code: "INVALID_EMPLOYMENT_END_DATE" });
  });

  it("rejects employment end dates before the start date", () => {
    const input: ClaimRecoveryInput = {
      corrections: [{ reasonCode: "EXIT_DATE_MISSING", employmentEndDate: "2019-12-31" }],
    };

    const result = validateClaimRecoveryInput(["EXIT_DATE_MISSING"], input, { pfAccount, employment });

    expect(result).toEqual({ valid: false, code: "EMPLOYMENT_END_BEFORE_START" });
  });
});

describe("remainingReasonCodes", () => {
  it("keeps unresolved reason codes", () => {
    expect(
      remainingReasonCodes(
        ["BANK_NAME_MISMATCH", "DOCUMENT_REQUIRED"],
        ["BANK_NAME_MISMATCH"],
      ),
    ).toEqual(["DOCUMENT_REQUIRED"]);
  });
});

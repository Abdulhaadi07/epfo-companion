import type { ClaimAction, ClaimEntity, ClaimReasonCode } from "./types";

const reasonActions: Record<ClaimReasonCode, readonly ClaimAction[]> = {
  BANK_NAME_MISMATCH: ["UPDATE_BANK_DETAILS"],
  BANK_NOT_VERIFIED: ["VERIFY_BANK_ACCOUNT"],
  EXIT_DATE_MISSING: ["ADD_EXIT_DATE"],
  KYC_INCOMPLETE: ["COMPLETE_KYC"],
  IDENTITY_MISMATCH: ["VERIFY_IDENTITY"],
  DOCUMENT_REQUIRED: ["UPLOAD_DOCUMENT"],
  CLAIM_REJECTED: ["FIX_CLAIM"],
};

export function getAllowedClaimActions(claim: Pick<ClaimEntity, "status" | "reasonCodes">): readonly ClaimAction[] {
  switch (claim.status) {
    case "DRAFT": return ["COMPLETE_READINESS"];
    case "READY": return ["SUBMIT_CLAIM"];
    case "ACTION_REQUIRED": return uniqueActions(claim.reasonCodes.flatMap((reason) => reasonActions[reason]));
    case "REJECTED": return uniqueActions(["VIEW_REJECTION_REASON", ...claim.reasonCodes.flatMap((reason) => reasonActions[reason])]);
    case "RESOLUTION": return ["RESUBMIT_CLAIM"];
    case "APPROVED": return ["VIEW_APPROVAL", "TRACK_SETTLEMENT"];
    case "SETTLED": return ["VIEW_SETTLEMENT"];
    default: return ["VIEW_STATUS"];
  }
}

function uniqueActions(actions: readonly ClaimAction[]): readonly ClaimAction[] { return [...new Set(actions)]; }

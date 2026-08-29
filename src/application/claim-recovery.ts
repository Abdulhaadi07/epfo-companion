import { toClaimEntity } from "@/application/claim-mapper";
import {
  remainingReasonCodes,
  validateClaimRecoveryInput,
  type ClaimRecoveryCorrection,
  type ClaimRecoveryInput,
  type ClaimRecoveryValidationErrorCode,
} from "@/application/claim-recovery-validation";
import { createTransactionalDatabase } from "@/db/transaction-client";
import {
  InvalidClaimTransitionError,
  transitionClaim,
  type ClaimEntity,
  type ClaimReasonCode,
  type ClaimStatus,
} from "@/domain/claims";
import {
  createClaimEventRepository,
  createClaimRepository,
  createEmploymentRepository,
  createPFAccountRepository,
  createUserRepository,
  type ClaimEventRecord,
  type ClaimRecord,
  type EmploymentRecord,
  type PFAccountRecord,
  type RepositoryDatabase,
  type UserRecord,
} from "@/repositories";

export type ClaimRecoveryErrorCode =
  | "CLAIM_NOT_FOUND"
  | "INVALID_STATE"
  | "VALIDATION_FAILED"
  | "PERSISTENCE_FAILED";

export type ClaimRecoveryError = {
  code: ClaimRecoveryErrorCode;
  validationCode?: ClaimRecoveryValidationErrorCode;
};

export type ClaimRecoverySuccess<T> = {
  ok: true;
  claim: T;
};

export type ClaimRecoveryFailure = {
  ok: false;
  error: ClaimRecoveryError;
};

export type ClaimRecoveryResult<T> = ClaimRecoverySuccess<T> | ClaimRecoveryFailure;

export type ResolvedClaimView = {
  id: string;
  status: ClaimStatus;
  reasonCodes: readonly ClaimReasonCode[];
};

export type ResubmittedClaimView = {
  id: string;
  status: ClaimStatus;
  reasonCodes: readonly ClaimReasonCode[];
};

export type ClaimRecoveryTransactionRepos = {
  updateClaimRecoveryState: (
    claimId: string,
    values: { currentStatus: ClaimStatus; reasonCodes: readonly ClaimReasonCode[]; updatedAt: Date },
  ) => Promise<void>;
  insertClaimEvent: (event: {
    id: string;
    claimId: string;
    eventType: "CLAIM_RESOLVED" | "CLAIM_RESUBMITTED";
    occurredAt: Date;
    reasonCode: ClaimReasonCode | null;
    metadata: Record<string, unknown> | null;
  }) => Promise<void>;
  updateBankCorrection: (
    pfAccountId: string,
    values: { bankDisplayName: string; bankStatus: "UNDER_VERIFICATION" },
  ) => Promise<void>;
  updateBankStatus: (pfAccountId: string, bankStatus: "UNDER_VERIFICATION") => Promise<void>;
  updateKycStatus: (pfAccountId: string, kycStatus: "UNDER_VERIFICATION") => Promise<void>;
  updateEmploymentEndDate: (employmentId: string, endDate: string) => Promise<void>;
  updateIdentityStatus: (userId: string, identityStatus: "UNDER_VERIFICATION") => Promise<void>;
};

export type ClaimRecoveryDeps = {
  findClaimById: (claimId: string) => Promise<ClaimRecord | undefined>;
  listClaimEventsByClaimId: (claimId: string) => Promise<ClaimEventRecord[]>;
  findPfAccountById: (pfAccountId: string) => Promise<PFAccountRecord | undefined>;
  findEmploymentById: (employmentId: string) => Promise<EmploymentRecord | undefined>;
  findUserById: (userId: string) => Promise<UserRecord | undefined>;
  runInTransaction: (work: (repos: ClaimRecoveryTransactionRepos) => Promise<void>) => Promise<void>;
};

const RESOLVABLE_STATUSES = new Set<ClaimStatus>(["ACTION_REQUIRED", "REJECTED"]);

function failure(
  code: ClaimRecoveryErrorCode,
  validationCode?: ClaimRecoveryValidationErrorCode,
): ClaimRecoveryFailure {
  return { ok: false, error: { code, ...(validationCode ? { validationCode } : {}) } };
}

function toResolvedClaimView(claim: ClaimEntity): ResolvedClaimView {
  return {
    id: claim.id,
    status: claim.status,
    reasonCodes: claim.reasonCodes,
  };
}

function toResubmittedClaimView(claim: ClaimEntity): ResubmittedClaimView {
  return {
    id: claim.id,
    status: claim.status,
    reasonCodes: claim.reasonCodes,
  };
}

/**
 * Applies CLAIM_RESOLVED through the domain state machine, then sets reason codes
 * from application-layer resolution logic. The domain transition clears reason codes;
 * only addressed reasons are removed here so returned and persisted state stay aligned.
 */
function applyResolvedTransition(
  claim: ClaimEntity,
  resolvedReasonCodes: readonly ClaimReasonCode[],
  occurredAt: string,
): ClaimEntity {
  const transitioned = transitionClaim(claim, { type: "CLAIM_RESOLVED" }, occurredAt);
  return {
    ...transitioned,
    reasonCodes: remainingReasonCodes(claim.reasonCodes, resolvedReasonCodes),
  };
}

/**
 * Applies CLAIM_RESUBMITTED through the domain state machine, then preserves the
 * claim's current reason codes. The domain transition clears reason codes; unresolved
 * reasons must carry forward into RESUBMITTED.
 */
function applyResubmittedTransition(claim: ClaimEntity, occurredAt: string): ClaimEntity {
  const transitioned = transitionClaim(claim, { type: "CLAIM_RESUBMITTED" }, occurredAt);
  return {
    ...transitioned,
    reasonCodes: claim.reasonCodes,
  };
}

function createDefaultClaimRecoveryDeps(): ClaimRecoveryDeps {
  const transactionalDb = createTransactionalDatabase();
  const readDb = transactionalDb as RepositoryDatabase;

  return {
    findClaimById: (claimId) => createClaimRepository(readDb).findById(claimId),
    listClaimEventsByClaimId: (claimId) => createClaimEventRepository(readDb).listByClaimId(claimId),
    findPfAccountById: (pfAccountId) => createPFAccountRepository(readDb).findById(pfAccountId),
    findEmploymentById: (employmentId) => createEmploymentRepository(readDb).findById(employmentId),
    findUserById: (userId) => createUserRepository(readDb).findById(userId),
    runInTransaction: async (work) => {
      await transactionalDb.transaction(async (tx) => {
        const repositoryDb = tx as RepositoryDatabase;
        const claimRepository = createClaimRepository(repositoryDb);
        const claimEventRepository = createClaimEventRepository(repositoryDb);
        const pfAccountRepository = createPFAccountRepository(repositoryDb);
        const employmentRepository = createEmploymentRepository(repositoryDb);
        const userRepository = createUserRepository(repositoryDb);

        await work({
          updateClaimRecoveryState: (claimId, values) =>
            claimRepository.updateRecoveryState(claimId, values),
          insertClaimEvent: (event) => claimEventRepository.insert(event),
          updateBankCorrection: (pfAccountId, values) =>
            pfAccountRepository.updateBankCorrection(pfAccountId, values),
          updateBankStatus: (pfAccountId, bankStatus) =>
            pfAccountRepository.updateBankStatus(pfAccountId, bankStatus),
          updateKycStatus: (pfAccountId, kycStatus) =>
            pfAccountRepository.updateKycStatus(pfAccountId, kycStatus),
          updateEmploymentEndDate: (employmentId, endDate) =>
            employmentRepository.updateEndDate(employmentId, endDate),
          updateIdentityStatus: (userId, identityStatus) =>
            userRepository.updateIdentityStatus(userId, identityStatus),
        });
      });
    },
  };
}

async function loadOwnedClaim(
  userId: string,
  claimId: string,
  deps: ClaimRecoveryDeps,
): Promise<
  | { ok: true; claim: ClaimRecord; claimEntity: ClaimEntity; events: ClaimEventRecord[] }
  | ClaimRecoveryFailure
> {
  const claim = await deps.findClaimById(claimId);
  if (!claim || claim.userId !== userId) {
    return failure("CLAIM_NOT_FOUND");
  }

  const events = await deps.listClaimEventsByClaimId(claimId);
  const claimEntity = toClaimEntity(claim, events);

  return { ok: true, claim, claimEntity, events };
}

async function applyRecoveryCorrections(
  repos: ClaimRecoveryTransactionRepos,
  context: {
    userId: string;
    claim: ClaimRecord;
    pfAccount: PFAccountRecord;
    employment: EmploymentRecord;
    corrections: readonly ClaimRecoveryCorrection[];
  },
): Promise<void> {
  for (const correction of context.corrections) {
    switch (correction.reasonCode) {
      case "BANK_NAME_MISMATCH":
        await repos.updateBankCorrection(context.pfAccount.id, {
          bankDisplayName: correction.bankDisplayName.trim(),
          bankStatus: "UNDER_VERIFICATION",
        });
        break;
      case "BANK_NOT_VERIFIED":
        await repos.updateBankStatus(context.pfAccount.id, "UNDER_VERIFICATION");
        break;
      case "KYC_INCOMPLETE":
        await repos.updateKycStatus(context.pfAccount.id, "UNDER_VERIFICATION");
        break;
      case "EXIT_DATE_MISSING":
        await repos.updateEmploymentEndDate(context.employment.id, correction.employmentEndDate);
        break;
      case "IDENTITY_MISMATCH":
        await repos.updateIdentityStatus(context.userId, "UNDER_VERIFICATION");
        break;
      case "DOCUMENT_REQUIRED":
      case "CLAIM_REJECTED":
        break;
      default: {
        const exhaustive: never = correction;
        throw new Error(`Unsupported recovery correction: ${String(exhaustive)}`);
      }
    }
  }
}

export async function resolveClaim(
  userId: string,
  claimId: string,
  input: ClaimRecoveryInput,
  deps: ClaimRecoveryDeps = createDefaultClaimRecoveryDeps(),
  occurredAt = new Date().toISOString(),
): Promise<ClaimRecoveryResult<ResolvedClaimView>> {
  const loaded = await loadOwnedClaim(userId, claimId, deps);
  if (!loaded.ok) return loaded;

  const { claim, claimEntity } = loaded;

  if (!RESOLVABLE_STATUSES.has(claimEntity.status)) {
    return failure("INVALID_STATE");
  }

  const pfAccount = await deps.findPfAccountById(claim.pfAccountId);
  if (!pfAccount || pfAccount.userId !== userId) {
    return failure("CLAIM_NOT_FOUND");
  }

  const employment = await deps.findEmploymentById(pfAccount.employmentId);
  if (!employment || employment.userId !== userId) {
    return failure("CLAIM_NOT_FOUND");
  }

  const validation = validateClaimRecoveryInput(claimEntity.reasonCodes, input, {
    pfAccount,
    employment,
  });
  if (!validation.valid) {
    return failure("VALIDATION_FAILED", validation.code);
  }

  let resolvedClaim: ClaimEntity;
  try {
    resolvedClaim = applyResolvedTransition(claimEntity, validation.resolvedReasonCodes, occurredAt);
  } catch (error) {
    if (error instanceof InvalidClaimTransitionError) {
      return failure("INVALID_STATE");
    }
    throw error;
  }
  const timelineEvent = resolvedClaim.timeline.at(-1);
  if (!timelineEvent || timelineEvent.type !== "CLAIM_RESOLVED") {
    throw new Error("Expected CLAIM_RESOLVED timeline event after transition.");
  }

  try {
    await deps.runInTransaction(async (repos) => {
      await applyRecoveryCorrections(repos, {
        userId,
        claim,
        pfAccount,
        employment,
        corrections: input.corrections,
      });
      await repos.updateClaimRecoveryState(claim.id, {
        currentStatus: resolvedClaim.status,
        reasonCodes: resolvedClaim.reasonCodes,
        updatedAt: new Date(occurredAt),
      });
      const resolvedReasonCodes = [...validation.resolvedReasonCodes];
      const remainingReasonCodes = [...resolvedClaim.reasonCodes];
      await repos.insertClaimEvent({
        id: timelineEvent.id,
        claimId: claim.id,
        eventType: "CLAIM_RESOLVED",
        occurredAt: new Date(occurredAt),
        reasonCode: null,
        metadata: { resolvedReasonCodes, remainingReasonCodes },
      });
    });
  } catch {
    return failure("PERSISTENCE_FAILED");
  }

  return { ok: true, claim: toResolvedClaimView(resolvedClaim) };
}

export async function resubmitClaim(
  userId: string,
  claimId: string,
  deps: ClaimRecoveryDeps = createDefaultClaimRecoveryDeps(),
  occurredAt = new Date().toISOString(),
): Promise<ClaimRecoveryResult<ResubmittedClaimView>> {
  const loaded = await loadOwnedClaim(userId, claimId, deps);
  if (!loaded.ok) return loaded;

  const { claim, claimEntity } = loaded;

  if (claimEntity.status !== "RESOLUTION") {
    return failure("INVALID_STATE");
  }

  let resubmittedClaim: ClaimEntity;
  try {
    resubmittedClaim = applyResubmittedTransition(claimEntity, occurredAt);
  } catch (error) {
    if (error instanceof InvalidClaimTransitionError) {
      return failure("INVALID_STATE");
    }
    throw error;
  }

  const timelineEvent = resubmittedClaim.timeline.at(-1);
  if (!timelineEvent || timelineEvent.type !== "CLAIM_RESUBMITTED") {
    throw new Error("Expected CLAIM_RESUBMITTED timeline event after transition.");
  }

  try {
    await deps.runInTransaction(async (repos) => {
      await repos.updateClaimRecoveryState(claim.id, {
        currentStatus: resubmittedClaim.status,
        reasonCodes: resubmittedClaim.reasonCodes,
        updatedAt: new Date(occurredAt),
      });
      const remainingReasonCodes = [...resubmittedClaim.reasonCodes];
      await repos.insertClaimEvent({
        id: timelineEvent.id,
        claimId: claim.id,
        eventType: "CLAIM_RESUBMITTED",
        occurredAt: new Date(occurredAt),
        reasonCode: null,
        metadata: { remainingReasonCodes },
      });
    });
  } catch {
    return failure("PERSISTENCE_FAILED");
  }

  return { ok: true, claim: toResubmittedClaimView(resubmittedClaim) };
}

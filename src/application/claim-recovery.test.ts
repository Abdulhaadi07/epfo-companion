import { describe, expect, it, vi } from "vitest";
import { toClaimEntity } from "@/application/claim-mapper";
import {
  resolveClaim,
  resubmitClaim,
  type ClaimRecoveryDeps,
  type ClaimRecoveryTransactionRepos,
} from "./claim-recovery";
import { transitionClaim, type ClaimEntity } from "@/domain/claims";
import type { ClaimEventRecord, ClaimRecord, EmploymentRecord, PFAccountRecord, UserRecord } from "@/repositories";

const USER_ID = "synthetic-user-action-required";
const OTHER_USER_ID = "synthetic-user-other";
const CLAIM_ID = "claim-action-required";
const PF_ACCOUNT_ID = "pf-action-required";
const EMPLOYMENT_ID = "employment-action-required";
const OCCURRED_AT = "2026-02-01T10:00:00.000Z";

const user: UserRecord = {
  id: USER_ID,
  uan: "100000000003",
  passwordHash: "hashed",
  displayName: "Kabir Rao",
  identityStatus: "READY",
  preferredLanguage: "en",
  preferredRegion: "Maharashtra",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const pfAccount: PFAccountRecord = {
  id: PF_ACCOUNT_ID,
  userId: USER_ID,
  employmentId: EMPLOYMENT_ID,
  syntheticMemberId: "SYN-MEMBER-ACTION",
  balanceInPaise: 9_758_000,
  bankDisplayName: "ICICI Bank",
  bankStatus: "ACTION_REQUIRED",
  kycStatus: "READY",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const employment: EmploymentRecord = {
  id: EMPLOYMENT_ID,
  userId: USER_ID,
  employerName: "Pune Precision Components Ltd",
  startDate: "2018-03-01",
  endDate: "2025-10-15",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

function buildActionRequiredClaim(
  reasonCodes: readonly ("BANK_NAME_MISMATCH" | "DOCUMENT_REQUIRED" | "KYC_INCOMPLETE")[] = ["BANK_NAME_MISMATCH"],
): { claim: ClaimRecord; events: ClaimEventRecord[]; entity: ClaimEntity } {
  const entity = transitionClaim(
  {
    id: CLAIM_ID,
    type: "FINAL_SETTLEMENT",
    citizenId: USER_ID,
    status: "UNDER_VERIFICATION",
    reasonCodes: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-04T00:00:00.000Z",
    timeline: [
      { id: `${CLAIM_ID}-1`, type: "CLAIM_MARKED_READY", occurredAt: "2026-01-02T00:00:00.000Z" },
      { id: `${CLAIM_ID}-2`, type: "CLAIM_SUBMITTED", occurredAt: "2026-01-03T00:00:00.000Z" },
      { id: `${CLAIM_ID}-3`, type: "VERIFICATION_STARTED", occurredAt: "2026-01-04T00:00:00.000Z" },
    ],
  },
  { type: "ACTION_REQUIRED", reasonCode: reasonCodes[0] ?? "BANK_NAME_MISMATCH" },
  "2026-01-05T00:00:00.000Z",
  );

  const claim: ClaimRecord = {
    id: CLAIM_ID,
    userId: USER_ID,
    pfAccountId: PF_ACCOUNT_ID,
    claimType: "FINAL_SETTLEMENT",
    currentStatus: entity.status,
    reasonCodes: [...reasonCodes],
    amountInPaise: pfAccount.balanceInPaise,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-05"),
  };

  const events: ClaimEventRecord[] = entity.timeline.map((event) => ({
    id: event.id,
    claimId: CLAIM_ID,
    eventType: event.type,
    reasonCode: "reasonCode" in event ? event.reasonCode ?? null : null,
    occurredAt: new Date(event.occurredAt),
    metadata: null,
  }));

  return { claim, events, entity: { ...entity, reasonCodes: [...reasonCodes] } };
}

function buildRejectedClaim(): { claim: ClaimRecord; events: ClaimEventRecord[]; entity: ClaimEntity } {
  const entity = transitionClaim(
    {
      id: "claim-rejected",
      type: "FINAL_SETTLEMENT",
      citizenId: USER_ID,
      status: "UNDER_VERIFICATION",
      reasonCodes: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-04T00:00:00.000Z",
      timeline: [
        { id: "claim-rejected-1", type: "CLAIM_MARKED_READY", occurredAt: "2026-01-02T00:00:00.000Z" },
        { id: "claim-rejected-2", type: "CLAIM_SUBMITTED", occurredAt: "2026-01-03T00:00:00.000Z" },
        { id: "claim-rejected-3", type: "VERIFICATION_STARTED", occurredAt: "2026-01-04T00:00:00.000Z" },
      ],
    },
    { type: "CLAIM_REJECTED", reasonCode: "KYC_INCOMPLETE" },
    "2026-01-05T00:00:00.000Z",
  );

  const claim: ClaimRecord = {
    id: "claim-rejected",
    userId: USER_ID,
    pfAccountId: PF_ACCOUNT_ID,
    claimType: "FINAL_SETTLEMENT",
    currentStatus: entity.status,
    reasonCodes: [...entity.reasonCodes],
    amountInPaise: pfAccount.balanceInPaise,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-05"),
  };

  const events: ClaimEventRecord[] = entity.timeline.map((event) => ({
    id: event.id,
    claimId: claim.id,
    eventType: event.type,
    reasonCode: "reasonCode" in event ? event.reasonCode ?? null : null,
    occurredAt: new Date(event.occurredAt),
    metadata: null,
  }));

  return { claim, events, entity };
}

type RecoveryState = {
  claim: ClaimRecord;
  events: ClaimEventRecord[];
  pfAccount: PFAccountRecord;
  employment: EmploymentRecord;
  user: UserRecord;
};

function createRecoveryDeps(initial: RecoveryState, options?: { failOnInsert?: boolean }) {
  const state = structuredClone(initial);
  const transactionCalls: Array<(repos: ClaimRecoveryTransactionRepos) => Promise<void>> = [];

  const deps: ClaimRecoveryDeps = {
    findClaimById: vi.fn(async (claimId: string) =>
      state.claim.id === claimId ? structuredClone(state.claim) : undefined,
    ),
    listClaimEventsByClaimId: vi.fn(async (claimId: string) =>
      state.claim.id === claimId ? structuredClone(state.events) : [],
    ),
    findPfAccountById: vi.fn(async (pfAccountId: string) =>
      state.pfAccount.id === pfAccountId ? structuredClone(state.pfAccount) : undefined,
    ),
    findEmploymentById: vi.fn(async (employmentId: string) =>
      state.employment.id === employmentId ? structuredClone(state.employment) : undefined,
    ),
    findUserById: vi.fn(async (userId: string) =>
      state.user.id === userId ? structuredClone(state.user) : undefined,
    ),
    runInTransaction: vi.fn(async (work) => {
      transactionCalls.push(work);
      const snapshot = structuredClone(state);
      const draft = structuredClone(state);
      const repos: ClaimRecoveryTransactionRepos = {
        updateClaimRecoveryState: async (claimId, values) => {
          if (draft.claim.id !== claimId) throw new Error("claim missing");
          draft.claim.currentStatus = values.currentStatus;
          draft.claim.reasonCodes = [...values.reasonCodes];
          draft.claim.updatedAt = values.updatedAt;
        },
        insertClaimEvent: async (event) => {
          if (options?.failOnInsert) throw new Error("insert failed");
          draft.events.push({
            id: event.id,
            claimId: event.claimId,
            eventType: event.eventType,
            reasonCode: event.reasonCode,
            occurredAt: event.occurredAt,
            metadata: event.metadata,
          });
        },
        updateBankCorrection: async (pfAccountId, values) => {
          if (draft.pfAccount.id !== pfAccountId) throw new Error("pf account missing");
          draft.pfAccount.bankDisplayName = values.bankDisplayName;
          draft.pfAccount.bankStatus = values.bankStatus;
        },
        updateBankStatus: async (pfAccountId, bankStatus) => {
          if (draft.pfAccount.id !== pfAccountId) throw new Error("pf account missing");
          draft.pfAccount.bankStatus = bankStatus;
        },
        updateKycStatus: async (pfAccountId, kycStatus) => {
          if (draft.pfAccount.id !== pfAccountId) throw new Error("pf account missing");
          draft.pfAccount.kycStatus = kycStatus;
        },
        updateEmploymentEndDate: async (employmentId, endDate) => {
          if (draft.employment.id !== employmentId) throw new Error("employment missing");
          draft.employment.endDate = endDate;
        },
        updateIdentityStatus: async (userId, identityStatus) => {
          if (draft.user.id !== userId) throw new Error("user missing");
          draft.user.identityStatus = identityStatus;
        },
      };

      try {
        await work(repos);
        Object.assign(state, draft);
      } catch {
        Object.assign(state, snapshot);
        throw new Error("transaction rolled back");
      }
    }),
  };

  return { deps, state, transactionCalls };
}

describe("resolveClaim", () => {
  it("allows the authenticated owner to resolve their own claim", async () => {
    const { claim, events } = buildActionRequiredClaim();
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resolveClaim(
      USER_ID,
      CLAIM_ID,
      { corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" }] },
      deps,
      OCCURRED_AT,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.claim.status).toBe("RESOLUTION");
    expect(result.claim.reasonCodes).toEqual([]);
    expect(state.claim.currentStatus).toBe("RESOLUTION");
    expect(state.pfAccount.bankDisplayName).toBe("State Bank of India");
    expect(state.pfAccount.bankStatus).toBe("UNDER_VERIFICATION");
    expect(state.events.at(-1)).toMatchObject({
      eventType: "CLAIM_RESOLVED",
      reasonCode: null,
    });
  });

  it("prevents another user from resolving a claim they do not own", async () => {
    const { claim, events } = buildActionRequiredClaim();
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resolveClaim(
      OTHER_USER_ID,
      CLAIM_ID,
      { corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" }] },
      deps,
      OCCURRED_AT,
    );

    expect(result).toEqual({ ok: false, error: { code: "CLAIM_NOT_FOUND" } });
    expect(state.claim.currentStatus).toBe("ACTION_REQUIRED");
    expect(state.events).toHaveLength(4);
  });

  it("moves ACTION_REQUIRED claims to RESOLUTION", async () => {
    const { claim, events } = buildActionRequiredClaim();
    const { deps } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resolveClaim(
      USER_ID,
      CLAIM_ID,
      { corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" }] },
      deps,
      OCCURRED_AT,
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.claim.status).toBe("RESOLUTION");
  });

  it("moves REJECTED claims to RESOLUTION", async () => {
    const rejected = buildRejectedClaim();
    const rejectedPfAccount = { ...pfAccount, kycStatus: "REJECTED" as const };
    const { deps } = createRecoveryDeps({
      claim: rejected.claim,
      events: rejected.events,
      pfAccount: rejectedPfAccount,
      employment,
      user,
    });

    const result = await resolveClaim(
      USER_ID,
      rejected.claim.id,
      { corrections: [{ reasonCode: "KYC_INCOMPLETE" }] },
      deps,
      OCCURRED_AT,
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.claim.status).toBe("RESOLUTION");
  });

  it("rejects resolve when the claim is not recoverable", async () => {
    const { claim, events } = buildActionRequiredClaim();
    claim.currentStatus = "UNDER_VERIFICATION";
    const { deps } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resolveClaim(
      USER_ID,
      CLAIM_ID,
      { corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" }] },
      deps,
      OCCURRED_AT,
    );

    expect(result).toEqual({ ok: false, error: { code: "INVALID_STATE" } });
  });

  it("rejects invalid corrections before mutation", async () => {
    const { claim, events } = buildActionRequiredClaim();
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resolveClaim(
      USER_ID,
      CLAIM_ID,
      { corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "ICICI Bank" }] },
      deps,
      OCCURRED_AT,
    );

    expect(result).toEqual({
      ok: false,
      error: { code: "VALIDATION_FAILED", validationCode: "INVALID_BANK_DISPLAY_NAME" },
    });
    expect(state.claim.currentStatus).toBe("ACTION_REQUIRED");
    expect(state.events).toHaveLength(4);
  });

  it("rolls back when persistence fails", async () => {
    const { claim, events } = buildActionRequiredClaim();
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user }, { failOnInsert: true });

    const result = await resolveClaim(
      USER_ID,
      CLAIM_ID,
      { corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" }] },
      deps,
      OCCURRED_AT,
    );

    expect(result).toEqual({ ok: false, error: { code: "PERSISTENCE_FAILED" } });
    expect(state.claim.currentStatus).toBe("ACTION_REQUIRED");
    expect(state.pfAccount.bankDisplayName).toBe("ICICI Bank");
    expect(state.events).toHaveLength(4);
  });

  it("produces deterministic resulting state for the same valid operation", async () => {
    const { claim, events } = buildActionRequiredClaim();
    const first = createRecoveryDeps({ claim, events, pfAccount, employment, user });
    const second = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const input = { corrections: [{ reasonCode: "BANK_NAME_MISMATCH" as const, bankDisplayName: "State Bank of India" }] };
    const firstResult = await resolveClaim(USER_ID, CLAIM_ID, input, first.deps, OCCURRED_AT);
    const secondResult = await resolveClaim(USER_ID, CLAIM_ID, input, second.deps, OCCURRED_AT);

    expect(firstResult).toEqual(secondResult);
  });

  describe("reason code consistency", () => {
    it("clears a single resolved reason code", async () => {
      const { claim, events } = buildActionRequiredClaim(["BANK_NAME_MISMATCH"]);
      const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

      const result = await resolveClaim(
        USER_ID,
        CLAIM_ID,
        { corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" }] },
        deps,
        OCCURRED_AT,
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.claim.reasonCodes).toEqual([]);
      expect(state.claim.reasonCodes).toEqual([]);
    });

    it("keeps unresolved reason codes when only one of several is addressed", async () => {
      const { claim, events } = buildActionRequiredClaim(["BANK_NAME_MISMATCH", "DOCUMENT_REQUIRED"]);
      const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

      const result = await resolveClaim(
        USER_ID,
        CLAIM_ID,
        { corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" }] },
        deps,
        OCCURRED_AT,
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.claim.reasonCodes).toEqual(["DOCUMENT_REQUIRED"]);
      expect(state.claim.reasonCodes).toEqual(["DOCUMENT_REQUIRED"]);
    });

    it("clears all reason codes when every outstanding reason is resolved", async () => {
      const { claim, events } = buildActionRequiredClaim(["BANK_NAME_MISMATCH", "DOCUMENT_REQUIRED"]);
      const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

      const result = await resolveClaim(
        USER_ID,
        CLAIM_ID,
        {
          corrections: [
            { reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" },
            { reasonCode: "DOCUMENT_REQUIRED" },
          ],
        },
        deps,
        OCCURRED_AT,
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.claim.reasonCodes).toEqual([]);
      expect(state.claim.reasonCodes).toEqual([]);
    });

    it("returns a claim view that matches the persisted claim state", async () => {
      const { claim, events } = buildActionRequiredClaim(["BANK_NAME_MISMATCH", "DOCUMENT_REQUIRED"]);
      const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

      const result = await resolveClaim(
        USER_ID,
        CLAIM_ID,
        { corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" }] },
        deps,
        OCCURRED_AT,
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.claim).toEqual({
        id: state.claim.id,
        status: state.claim.currentStatus,
        reasonCodes: [...state.claim.reasonCodes],
      });
    });

    it("keeps claim event history in chronological order", async () => {
      const { claim, events } = buildActionRequiredClaim(["BANK_NAME_MISMATCH"]);
      const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

      const result = await resolveClaim(
        USER_ID,
        CLAIM_ID,
        { corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" }] },
        deps,
        OCCURRED_AT,
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const occurredAtValues = state.events.map((event) => event.occurredAt.getTime());
      expect(occurredAtValues).toEqual([...occurredAtValues].sort((left, right) => left - right));
      expect(state.events.at(-1)?.eventType).toBe("CLAIM_RESOLVED");
    });
  });
});

describe("resubmitClaim", () => {
  function buildResolutionState() {
    const actionRequired = buildActionRequiredClaim();
    const resolvedEntity = transitionClaim(actionRequired.entity, { type: "CLAIM_RESOLVED" }, OCCURRED_AT);
    const claim: ClaimRecord = {
      ...actionRequired.claim,
      currentStatus: resolvedEntity.status,
      reasonCodes: [],
      updatedAt: new Date(OCCURRED_AT),
    };
    const events: ClaimEventRecord[] = [
      ...actionRequired.events,
      {
        id: `${CLAIM_ID}-5`,
        claimId: CLAIM_ID,
        eventType: "CLAIM_RESOLVED",
        reasonCode: null,
        occurredAt: new Date(OCCURRED_AT),
        metadata: null,
      },
    ];

    return { claim, events };
  }

  it("allows the authenticated owner to resubmit their own claim", async () => {
    const { claim, events } = buildResolutionState();
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resubmitClaim(USER_ID, CLAIM_ID, deps, "2026-02-02T10:00:00.000Z");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.claim.status).toBe("RESUBMITTED");
    expect(state.claim.currentStatus).toBe("RESUBMITTED");
    expect(state.events.at(-1)).toMatchObject({
      eventType: "CLAIM_RESUBMITTED",
      reasonCode: null,
    });
  });

  it("prevents another user from resubmitting a claim they do not own", async () => {
    const { claim, events } = buildResolutionState();
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resubmitClaim(OTHER_USER_ID, CLAIM_ID, deps, "2026-02-02T10:00:00.000Z");

    expect(result).toEqual({ ok: false, error: { code: "CLAIM_NOT_FOUND" } });
    expect(state.claim.currentStatus).toBe("RESOLUTION");
    expect(state.events).toHaveLength(5);
  });

  it("moves RESOLUTION claims to RESUBMITTED", async () => {
    const { claim, events } = buildResolutionState();
    const { deps } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resubmitClaim(USER_ID, CLAIM_ID, deps, "2026-02-02T10:00:00.000Z");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.claim.status).toBe("RESUBMITTED");
  });

  it("rejects resubmit when the claim is not in RESOLUTION", async () => {
    const { claim, events } = buildActionRequiredClaim();
    const { deps } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resubmitClaim(USER_ID, CLAIM_ID, deps, "2026-02-02T10:00:00.000Z");

    expect(result).toEqual({ ok: false, error: { code: "INVALID_STATE" } });
  });

  it("does not automatically advance RESUBMITTED to verification", async () => {
    const { claim, events } = buildResolutionState();
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });
    const verificationEventsBefore = state.events.filter((event) => event.eventType === "VERIFICATION_STARTED").length;

    const result = await resubmitClaim(USER_ID, CLAIM_ID, deps, "2026-02-02T10:00:00.000Z");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.claim.status).toBe("RESUBMITTED");
    const verificationEventsAfter = state.events.filter((event) => event.eventType === "VERIFICATION_STARTED").length;
    expect(verificationEventsAfter).toBe(verificationEventsBefore);
    expect(state.events.at(-1)?.eventType).toBe("CLAIM_RESUBMITTED");
  });

  it("records a dedicated claim event for resubmission", async () => {
    const { claim, events } = buildResolutionState();
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    await resubmitClaim(USER_ID, CLAIM_ID, deps, "2026-02-02T10:00:00.000Z");

    const resubmittedEvent = state.events.find((event) => event.eventType === "CLAIM_RESUBMITTED");
    expect(resubmittedEvent).toBeDefined();
    expect(resubmittedEvent?.reasonCode).toBeNull();
  });

  it("produces deterministic resulting state for the same valid operation", async () => {
    const { claim, events } = buildResolutionState();
    const first = createRecoveryDeps({ claim, events, pfAccount, employment, user });
    const second = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const firstResult = await resubmitClaim(USER_ID, CLAIM_ID, first.deps, "2026-02-02T10:00:00.000Z");
    const secondResult = await resubmitClaim(USER_ID, CLAIM_ID, second.deps, "2026-02-02T10:00:00.000Z");

    expect(firstResult).toEqual(secondResult);
  });

  it("preserves remaining reason codes after partial resolution", async () => {
    const actionRequired = buildActionRequiredClaim(["BANK_NAME_MISMATCH", "DOCUMENT_REQUIRED"]);
    const claim: ClaimRecord = {
      ...actionRequired.claim,
      currentStatus: "RESOLUTION",
      reasonCodes: ["DOCUMENT_REQUIRED"],
      updatedAt: new Date(OCCURRED_AT),
    };
    const events: ClaimEventRecord[] = [
      ...actionRequired.events,
      {
        id: `${CLAIM_ID}-5`,
        claimId: CLAIM_ID,
        eventType: "CLAIM_RESOLVED",
        reasonCode: null,
        occurredAt: new Date(OCCURRED_AT),
        metadata: null,
      },
    ];
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resubmitClaim(USER_ID, CLAIM_ID, deps, "2026-02-02T10:00:00.000Z");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.claim.reasonCodes).toEqual(["DOCUMENT_REQUIRED"]);
    expect(state.claim.reasonCodes).toEqual(["DOCUMENT_REQUIRED"]);
    expect(result.claim).toEqual({
      id: state.claim.id,
      status: state.claim.currentStatus,
      reasonCodes: [...state.claim.reasonCodes],
    });
  });
});

describe("claim recovery mapping", () => {
  it("uses the centralized claim mapper before transitions", () => {
    const { claim, events } = buildActionRequiredClaim();
    const entity = toClaimEntity(claim, events);

    expect(entity.status).toBe("ACTION_REQUIRED");
    expect(entity.reasonCodes).toEqual(["BANK_NAME_MISMATCH"]);
    expect(entity.timeline).toHaveLength(4);
  });
});

describe("audit trail metadata", () => {
  it("records resolved and remaining reason codes in CLAIM_RESOLVED metadata", async () => {
    const { claim, events } = buildActionRequiredClaim(["BANK_NAME_MISMATCH", "DOCUMENT_REQUIRED"]);
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resolveClaim(
      USER_ID,
      CLAIM_ID,
      { corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" }] },
      deps,
      OCCURRED_AT,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const resolvedEvent = state.events.find((event) => event.eventType === "CLAIM_RESOLVED");
    expect(resolvedEvent).toBeDefined();
    expect(resolvedEvent?.metadata).toEqual({
      resolvedReasonCodes: ["BANK_NAME_MISMATCH"],
      remainingReasonCodes: ["DOCUMENT_REQUIRED"],
    });
  });

  it("records empty remaining codes when all reasons are resolved", async () => {
    const { claim, events } = buildActionRequiredClaim(["BANK_NAME_MISMATCH"]);
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resolveClaim(
      USER_ID,
      CLAIM_ID,
      { corrections: [{ reasonCode: "BANK_NAME_MISMATCH", bankDisplayName: "State Bank of India" }] },
      deps,
      OCCURRED_AT,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const resolvedEvent = state.events.find((event) => event.eventType === "CLAIM_RESOLVED");
    expect(resolvedEvent?.metadata).toEqual({
      resolvedReasonCodes: ["BANK_NAME_MISMATCH"],
      remainingReasonCodes: [],
    });
  });

  it("records remaining reason codes in CLAIM_RESUBMITTED metadata", async () => {
    const actionRequired = buildActionRequiredClaim(["BANK_NAME_MISMATCH", "DOCUMENT_REQUIRED"]);
    const claim = {
      ...actionRequired.claim,
      currentStatus: "RESOLUTION" as const,
      reasonCodes: ["DOCUMENT_REQUIRED" as const],
      updatedAt: new Date(OCCURRED_AT),
    };
    const events: ClaimEventRecord[] = [
      ...actionRequired.events,
      {
        id: `${CLAIM_ID}-5`,
        claimId: CLAIM_ID,
        eventType: "CLAIM_RESOLVED",
        reasonCode: null,
        occurredAt: new Date(OCCURRED_AT),
        metadata: null,
      },
    ];
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resubmitClaim(USER_ID, CLAIM_ID, deps, "2026-02-02T10:00:00.000Z");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const resubmittedEvent = state.events.find((event) => event.eventType === "CLAIM_RESUBMITTED");
    expect(resubmittedEvent).toBeDefined();
    expect(resubmittedEvent?.metadata).toEqual({
      remainingReasonCodes: ["DOCUMENT_REQUIRED"],
    });
  });

  it("records empty remaining codes when resubmitting with no unresolved reasons", async () => {
    const actionRequired = buildActionRequiredClaim(["BANK_NAME_MISMATCH"]);
    const claim = {
      ...actionRequired.claim,
      currentStatus: "RESOLUTION" as const,
      reasonCodes: [],
      updatedAt: new Date(OCCURRED_AT),
    };
    const events: ClaimEventRecord[] = [
      ...actionRequired.events,
      {
        id: `${CLAIM_ID}-5`,
        claimId: CLAIM_ID,
        eventType: "CLAIM_RESOLVED",
        reasonCode: null,
        occurredAt: new Date(OCCURRED_AT),
        metadata: null,
      },
    ];
    const { deps, state } = createRecoveryDeps({ claim, events, pfAccount, employment, user });

    const result = await resubmitClaim(USER_ID, CLAIM_ID, deps, "2026-02-02T10:00:00.000Z");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const resubmittedEvent = state.events.find((event) => event.eventType === "CLAIM_RESUBMITTED");
    expect(resubmittedEvent?.metadata).toEqual({
      remainingReasonCodes: [],
    });
  });
});

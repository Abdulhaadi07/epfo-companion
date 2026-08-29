import { createDatabase } from "@/db/client";
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
  type UserRecord,
} from "@/repositories";
import type { ClaimAction, ClaimStatus } from "@/domain/claims";
import { getAllowedClaimActions } from "@/domain/claims";
import { toClaimEntity } from "@/application/claim-mapper";
import { selectActiveClaim } from "@/application/claim-selection";
import { assembleReadiness, type CitizenHomeReadinessView } from "@/application/readiness";
import { buildTimelinePreview, type TimelinePreviewItem } from "@/application/timeline";
import { buildClaimPresentation, getReasonSummaryKeys, type ClaimPresentationModel } from "@/lib/claim-presentation";
import { formatCurrencyInPaise, formatEmploymentPeriod } from "@/lib/format";

export const PROTOTYPE_DISCLOSURE_KEY = "common.prototypeDisclosure" as const;

import type { TranslationKey } from "@/i18n/keys";

export type CitizenHomeActiveClaimView = {
  id: string;
  status: ClaimStatus;
  presentation: ClaimPresentationModel;
  allowedActions: readonly ClaimAction[];
  reasonSummaryKeys: readonly TranslationKey[];
  timelinePreview: readonly TimelinePreviewItem[];
};

export type CitizenHomeAccountSummaryView = {
  balanceDisplay: string;
};

export type CitizenHomeEmploymentSummaryView = {
  employerName: string;
  periodDisplay: string;
};

export type CitizenHomeHelpPromptView = {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  href: string;
  linkLabelKey: TranslationKey;
};

export type CitizenHomeView = {
  greeting: {
    displayName: string;
  };
  activeClaim: CitizenHomeActiveClaimView | null;
  accountSummary: CitizenHomeAccountSummaryView;
  employmentSummary: CitizenHomeEmploymentSummaryView;
  readiness: CitizenHomeReadinessView;
  helpPrompt: CitizenHomeHelpPromptView;
};

export type CitizenHomeDeps = {
  findUserById: (userId: string) => Promise<UserRecord | undefined>;
  listEmploymentByUserId: (userId: string) => Promise<EmploymentRecord[]>;
  listPfAccountsByUserId: (userId: string) => Promise<PFAccountRecord[]>;
  listClaimsByUserId: (userId: string) => Promise<ClaimRecord[]>;
  listClaimEventsByClaimId: (claimId: string) => Promise<ClaimEventRecord[]>;
};

function createDefaultCitizenHomeDeps(): CitizenHomeDeps {
  const db = createDatabase();
  const userRepository = createUserRepository(db);
  const employmentRepository = createEmploymentRepository(db);
  const pfAccountRepository = createPFAccountRepository(db);
  const claimRepository = createClaimRepository(db);
  const claimEventRepository = createClaimEventRepository(db);

  return {
    findUserById: (userId) => userRepository.findById(userId),
    listEmploymentByUserId: (userId) => employmentRepository.listByUserId(userId),
    listPfAccountsByUserId: (userId) => pfAccountRepository.listByUserId(userId),
    listClaimsByUserId: (userId) => claimRepository.listByUserId(userId),
    listClaimEventsByClaimId: (claimId) => claimEventRepository.listByClaimId(claimId),
  };
}

function selectPfAccount(
  pfAccounts: readonly PFAccountRecord[],
  activeClaim: ClaimRecord | null,
): PFAccountRecord | null {
  if (activeClaim) {
    return pfAccounts.find((account) => account.id === activeClaim.pfAccountId) ?? null;
  }

  return [...pfAccounts].sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime() || left.id.localeCompare(right.id))[0] ?? null;
}

function selectEmployment(
  employments: readonly EmploymentRecord[],
  pfAccount: PFAccountRecord | null,
): EmploymentRecord | null {
  if (pfAccount) {
    return employments.find((employment) => employment.id === pfAccount.employmentId) ?? null;
  }

  return [...employments].sort((left, right) => right.startDate.localeCompare(left.startDate) || left.id.localeCompare(right.id))[0] ?? null;
}

function buildActiveClaimView(
  claim: ClaimRecord,
  events: readonly ClaimEventRecord[],
): CitizenHomeActiveClaimView {
  const claimEntity = toClaimEntity(claim, events);
  const allowedActions = getAllowedClaimActions(claimEntity);

  return {
    id: claimEntity.id,
    status: claimEntity.status,
    allowedActions,
    reasonSummaryKeys: getReasonSummaryKeys(claimEntity.reasonCodes),
    presentation: buildClaimPresentation({
      status: claimEntity.status,
      reasonCodes: claimEntity.reasonCodes,
      allowedActions,
    }),
    timelinePreview: buildTimelinePreview(claimEntity.timeline),
  };
}

export async function getCitizenHomeView(
  userId: string,
  deps: CitizenHomeDeps = createDefaultCitizenHomeDeps(),
): Promise<CitizenHomeView | null> {
  const user = await deps.findUserById(userId);
  if (!user) return null;

  const [employments, pfAccounts, claims] = await Promise.all([
    deps.listEmploymentByUserId(userId),
    deps.listPfAccountsByUserId(userId),
    deps.listClaimsByUserId(userId),
  ]);

  const activeClaimRecord = selectActiveClaim(claims);
  const pfAccount = selectPfAccount(pfAccounts, activeClaimRecord);
  const employment = selectEmployment(employments, pfAccount);

  if (!pfAccount || !employment) return null;

  const events = activeClaimRecord
    ? await deps.listClaimEventsByClaimId(activeClaimRecord.id)
    : [];

  const readiness = assembleReadiness({
    identityStatus: user.identityStatus,
    bankStatus: pfAccount.bankStatus,
    kycStatus: pfAccount.kycStatus,
  });

  return {
    greeting: {
      displayName: user.displayName,
    },
    activeClaim: activeClaimRecord ? buildActiveClaimView(activeClaimRecord, events) : null,
    accountSummary: {
      balanceDisplay: formatCurrencyInPaise(pfAccount.balanceInPaise),
    },
    employmentSummary: {
      employerName: employment.employerName,
      periodDisplay: formatEmploymentPeriod(employment.startDate, employment.endDate),
    },
    readiness,
    helpPrompt: {
      titleKey: "home.helpPromptTitle",
      descriptionKey: "home.helpPromptDescription",
      href: "/help#claim-stuck",
      linkLabelKey: "home.helpPromptLink",
    },
  };
}

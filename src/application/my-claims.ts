import { createDatabase } from "@/db/client";
import { createClaimRepository, createUserRepository, type ClaimRecord, type UserRecord } from "@/repositories";
import type { ClaimStatus } from "@/domain/claims";
import { getAllowedClaimActions } from "@/domain/claims";
import { sortClaimsForList } from "@/application/claim-selection";
import { buildClaimPresentation, getReasonSummaryKeys, type ClaimPresentationModel } from "@/lib/claim-presentation";
import type { TranslationKey } from "@/i18n/keys";
import { formatDateTime } from "@/lib/format";

export type MyClaimsPrimaryActionView = {
  labelKey: TranslationKey;
  href: string;
};

export type MyClaimsListItemView = {
  id: string;
  status: ClaimStatus;
  presentation: ClaimPresentationModel;
  reasonSummaryKeys: readonly TranslationKey[];
  actionRequired: boolean;
  primaryAction: MyClaimsPrimaryActionView;
  updatedDisplay: string;
  isSettled: boolean;
  viewHref: string;
};

export type MyClaimsView = {
  greeting: {
    displayName: string;
  };
  claims: readonly MyClaimsListItemView[];
  isEmpty: boolean;
};

export type MyClaimsDeps = {
  findUserById: (userId: string) => Promise<UserRecord | undefined>;
  listClaimsByUserId: (userId: string) => Promise<ClaimRecord[]>;
};

function createDefaultMyClaimsDeps(): MyClaimsDeps {
  const db = createDatabase();
  const userRepository = createUserRepository(db);
  const claimRepository = createClaimRepository(db);

  return {
    findUserById: (userId) => userRepository.findById(userId),
    listClaimsByUserId: (userId) => claimRepository.listByUserId(userId),
  };
}

function resolveViewHref(status: ClaimStatus, actionHref: string): string {
  if (status === "SETTLED") return actionHref;
  if (actionHref === "/claim/status") return "/home";
  return actionHref;
}

function buildClaimListItem(claim: ClaimRecord): MyClaimsListItemView {
  const allowedActions = getAllowedClaimActions({
    status: claim.currentStatus,
    reasonCodes: claim.reasonCodes,
  });
  const presentation = buildClaimPresentation({
    status: claim.currentStatus,
    reasonCodes: claim.reasonCodes,
    allowedActions,
  });

  return {
    id: claim.id,
    status: claim.currentStatus,
    presentation,
    reasonSummaryKeys: getReasonSummaryKeys(claim.reasonCodes),
    actionRequired: presentation.actionRequired,
    primaryAction: {
      labelKey: presentation.actionLabelKey,
      href: presentation.actionHref,
    },
    updatedDisplay: formatDateTime(claim.updatedAt.toISOString()),
    isSettled: claim.currentStatus === "SETTLED",
    viewHref: resolveViewHref(claim.currentStatus, presentation.actionHref),
  };
}

export async function getMyClaimsView(
  userId: string,
  deps: MyClaimsDeps = createDefaultMyClaimsDeps(),
): Promise<MyClaimsView | null> {
  const user = await deps.findUserById(userId);
  if (!user) return null;

  const claims = sortClaimsForList(await deps.listClaimsByUserId(userId)).map(buildClaimListItem);

  return {
    greeting: {
      displayName: user.displayName,
    },
    claims,
    isEmpty: claims.length === 0,
  };
}

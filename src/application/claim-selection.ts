import type { ClaimRecord } from "@/repositories";

const TERMINAL_CLAIM_STATUS = "SETTLED" as const;

function isSettledClaim(claim: ClaimRecord): boolean {
  return claim.currentStatus === TERMINAL_CLAIM_STATUS;
}

function compareClaims(left: ClaimRecord, right: ClaimRecord): number {
  const updatedDiff = right.updatedAt.getTime() - left.updatedAt.getTime();
  if (updatedDiff !== 0) return updatedDiff;
  return left.id.localeCompare(right.id);
}

function compareClaimsForList(left: ClaimRecord, right: ClaimRecord): number {
  const leftSettled = isSettledClaim(left);
  const rightSettled = isSettledClaim(right);
  if (leftSettled !== rightSettled) return leftSettled ? 1 : -1;
  return compareClaims(left, right);
}

/**
 * Claims-list ordering:
 * 1. Non-settled claims first.
 * 2. Most recently updated first within each group.
 * 3. Break ties by claim id ascending.
 */
export function sortClaimsForList(claims: readonly ClaimRecord[]): ClaimRecord[] {
  return [...claims].sort(compareClaimsForList);
}

/**
 * Active-claim policy:
 * 1. Prefer claims that are not SETTLED.
 * 2. Among candidates, choose the most recently updated claim.
 * 3. Break ties by claim id ascending.
 */
export function selectActiveClaim(claims: readonly ClaimRecord[]): ClaimRecord | null {
  if (claims.length === 0) return null;

  const inProgress = claims.filter((claim) => claim.currentStatus !== TERMINAL_CLAIM_STATUS);
  const candidates = inProgress.length > 0 ? inProgress : [...claims];
  return [...candidates].sort(compareClaims)[0] ?? null;
}

import { describe, expect, it, vi } from "vitest";
import type { ClaimRecord, EmploymentRecord, PFAccountRecord, UserRecord } from "@/repositories";
import { getUserDisplayName, loadUserHomeData } from "./user-account";

const user = {
  id: "synthetic-user-under_verification",
  loginId: "sample-under_verification",
  passwordHash: "hashed",
  displayName: "Mira Sen",
  identityStatus: "UNDER_VERIFICATION",
  preferredLanguage: "en",
  preferredRegion: "Maharashtra",
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies UserRecord;

const employment = {
  id: "synthetic-employment-under_verification",
  userId: user.id,
  employerName: "Northline Retail Pvt. Ltd.",
  startDate: "2020-04-01",
  endDate: "2024-08-31",
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies EmploymentRecord;

const pfAccount = {
  id: "synthetic-pf-account-under_verification",
  userId: user.id,
  employmentId: employment.id,
  syntheticMemberId: "SYN-MEMBER-UNDER_VERIFICATION",
  balanceInPaise: 18425000,
  bankDisplayName: "State Bank of India",
  bankStatus: "UNDER_VERIFICATION",
  kycStatus: "UNDER_VERIFICATION",
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies PFAccountRecord;

const claim = {
  id: "synthetic-claim-under_verification",
  userId: user.id,
  pfAccountId: pfAccount.id,
  claimType: "FINAL_SETTLEMENT",
  currentStatus: "UNDER_VERIFICATION",
  reasonCodes: [],
  amountInPaise: 18425000,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies ClaimRecord;

describe("loadUserHomeData", () => {
  it("loads the authenticated user's persisted account graph", async () => {
    const data = await loadUserHomeData(user.id, {
      findUserById: vi.fn(async () => user),
      listEmploymentByUserId: vi.fn(async () => [employment]),
      listPfAccountsByUserId: vi.fn(async () => [pfAccount]),
      listClaimsByUserId: vi.fn(async () => [claim]),
    });

    expect(data).toEqual({ user, employment, pfAccount, claim });
    expect(data?.user.displayName).toBe("Mira Sen");
    expect(data?.claim.currentStatus).toBe("UNDER_VERIFICATION");
  });

  it("returns null when the user record is missing", async () => {
    const data = await loadUserHomeData("missing-user", {
      findUserById: vi.fn(async () => undefined),
      listEmploymentByUserId: vi.fn(async () => []),
      listPfAccountsByUserId: vi.fn(async () => []),
      listClaimsByUserId: vi.fn(async () => []),
    });

    expect(data).toBeNull();
  });
});

describe("getUserDisplayName", () => {
  it("returns the persisted display name for the authenticated user", async () => {
    const displayName = await getUserDisplayName(user.id, {
      findUserById: vi.fn(async () => user),
    });

    expect(displayName).toBe("Mira Sen");
  });
});

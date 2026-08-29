import { createDatabase } from "@/db/client";
import {
  createClaimRepository,
  createEmploymentRepository,
  createPFAccountRepository,
  createUserRepository,
  type ClaimRecord,
  type EmploymentRecord,
  type PFAccountRecord,
  type UserRecord,
} from "@/repositories";

export type UserHomeData = {
  user: UserRecord;
  employment: EmploymentRecord;
  pfAccount: PFAccountRecord;
  claim: ClaimRecord;
};

export type UserAccountDeps = {
  findUserById: (userId: string) => Promise<UserRecord | undefined>;
  listEmploymentByUserId: (userId: string) => Promise<EmploymentRecord[]>;
  listPfAccountsByUserId: (userId: string) => Promise<PFAccountRecord[]>;
  listClaimsByUserId: (userId: string) => Promise<ClaimRecord[]>;
};

function createDefaultUserAccountDeps(): UserAccountDeps {
  const db = createDatabase();
  const userRepository = createUserRepository(db);
  const employmentRepository = createEmploymentRepository(db);
  const pfAccountRepository = createPFAccountRepository(db);
  const claimRepository = createClaimRepository(db);

  return {
    findUserById: (userId) => userRepository.findById(userId),
    listEmploymentByUserId: (userId) => employmentRepository.listByUserId(userId),
    listPfAccountsByUserId: (userId) => pfAccountRepository.listByUserId(userId),
    listClaimsByUserId: (userId) => claimRepository.listByUserId(userId),
  };
}

export async function loadUserHomeData(
  userId: string,
  deps: UserAccountDeps = createDefaultUserAccountDeps(),
): Promise<UserHomeData | null> {
  const user = await deps.findUserById(userId);
  if (!user) return null;

  const [employment] = await deps.listEmploymentByUserId(userId);
  const [pfAccount] = await deps.listPfAccountsByUserId(userId);
  const [claim] = await deps.listClaimsByUserId(userId);

  if (!employment || !pfAccount || !claim) return null;

  return { user, employment, pfAccount, claim };
}

export async function getUserDisplayName(
  userId: string,
  deps: Pick<UserAccountDeps, "findUserById"> = createDefaultUserAccountDeps(),
): Promise<string | null> {
  const user = await deps.findUserById(userId);
  return user?.displayName ?? null;
}

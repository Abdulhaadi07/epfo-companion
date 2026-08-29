import { config } from "dotenv";

config({
  path: ".env.local",
  override: true,
});
import { inArray, sql } from "drizzle-orm";
import { createTransactionalDatabase } from "./transaction-client";
import { buildSeedData } from "./seed-data";
import { claimEvents, claims, employmentRecords, pfAccounts, users } from "./schema";

export const SEED_INSERTION_ORDER = ["users", "employmentRecords", "pfAccounts", "claims", "claimEvents"] as const;

export async function insertSeedData(db: ReturnType<typeof createTransactionalDatabase>, data: Awaited<ReturnType<typeof buildSeedData>>) {
  const syntheticClaimIds = data.claims.map((claim) => claim.id);

  await db.transaction(async (tx) => {
    await tx.insert(users).values(data.users).onConflictDoUpdate({
      target: users.id,
      set: {
        uan: sql`excluded.uan`,
        passwordHash: sql`excluded.password_hash`,
        displayName: sql`excluded.display_name`,
        identityStatus: sql`excluded.identity_status`,
        preferredLanguage: sql`excluded.preferred_language`,
        preferredRegion: sql`excluded.preferred_region`,
        updatedAt: sql`now()`,
      },
    });
    await tx.insert(employmentRecords).values(data.employmentRecords).onConflictDoUpdate({
      target: employmentRecords.id,
      set: {
        userId: sql`excluded.user_id`,
        employerName: sql`excluded.employer_name`,
        startDate: sql`excluded.start_date`,
        endDate: sql`excluded.end_date`,
        updatedAt: sql`now()`,
      },
    });
    await tx.insert(pfAccounts).values(data.pfAccounts).onConflictDoUpdate({
      target: pfAccounts.id,
      set: {
        userId: sql`excluded.user_id`,
        employmentId: sql`excluded.employment_id`,
        syntheticMemberId: sql`excluded.synthetic_member_id`,
        balanceInPaise: sql`excluded.balance_in_paise`,
        bankDisplayName: sql`excluded.bank_display_name`,
        bankStatus: sql`excluded.bank_status`,
        kycStatus: sql`excluded.kyc_status`,
        updatedAt: sql`now()`,
      },
    });
    await tx.insert(claims).values(data.claims).onConflictDoUpdate({
      target: claims.id,
      set: {
        userId: sql`excluded.user_id`,
        pfAccountId: sql`excluded.pf_account_id`,
        claimType: sql`excluded.claim_type`,
        currentStatus: sql`excluded.current_status`,
        reasonCodes: sql`excluded.reason_codes`,
        amountInPaise: sql`excluded.amount_in_paise`,
        updatedAt: sql`excluded.updated_at`,
      },
    });
    await tx.delete(claimEvents).where(inArray(claimEvents.claimId, syntheticClaimIds));
    await tx.insert(claimEvents).values(data.claimEvents);
  });
}

async function seed() {
  const db = createTransactionalDatabase();
  try {
    const data = await buildSeedData();
    await insertSeedData(db, data);
    console.log(`Seeded ${data.users.length} synthetic users and ${data.claims.length} claims.`);
    console.log(`Synthetic claim events: ${data.claimEvents.length}.`);
  } finally {
    await db.$client.end();
  }
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seed().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}

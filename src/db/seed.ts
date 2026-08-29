import { config } from "dotenv";

config({
  path: ".env.local",
  override: true,
});
import { createTransactionalDatabase } from "./transaction-client";
import { buildSeedData } from "./seed-data";
import { claimEvents, claims, employmentRecords, pfAccounts, users } from "./schema";

export const SEED_INSERTION_ORDER = ["users", "employmentRecords", "pfAccounts", "claims", "claimEvents"] as const;

export async function insertSeedData(db: ReturnType<typeof createTransactionalDatabase>, data: Awaited<ReturnType<typeof buildSeedData>>) {
  await db.transaction(async (tx) => {
    await tx.insert(users).values(data.users).onConflictDoNothing();
    await tx.insert(employmentRecords).values(data.employmentRecords).onConflictDoNothing();
    await tx.insert(pfAccounts).values(data.pfAccounts).onConflictDoNothing();
    await tx.insert(claims).values(data.claims).onConflictDoNothing();
    await tx.insert(claimEvents).values(data.claimEvents).onConflictDoNothing();
  });
}

async function seed() {
  const db = createTransactionalDatabase();
  try {
    const data = await buildSeedData();
    await insertSeedData(db, data);
    console.log(`Seeded ${data.users.length} synthetic users and ${data.claims.length} claims.`);
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

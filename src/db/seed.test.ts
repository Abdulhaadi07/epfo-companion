import { describe, expect, it } from "vitest";
import { claimEvents, claims, employmentRecords, pfAccounts, users } from "./schema";
import { insertSeedData, SEED_INSERTION_ORDER } from "./seed";
import { buildSeedData } from "./seed-data";

describe("synthetic seed persistence", () => {
  it("declares and executes foreign-key-safe insertion order", async () => {
    expect(SEED_INSERTION_ORDER).toEqual(["users", "employmentRecords", "pfAccounts", "claims", "claimEvents"]);
    const tableNames = new Map<unknown, string>([[users, "users"], [employmentRecords, "employmentRecords"], [pfAccounts, "pfAccounts"], [claims, "claims"], [claimEvents, "claimEvents"]]);
    const inserted: string[] = [];
    const db = {
      transaction: async (callback: (tx: unknown) => Promise<void>) => callback({
        insert: (table: typeof users) => ({
          values: () => ({
            onConflictDoNothing: async () => { inserted.push(tableNames.get(table) ?? "unknown"); },
          }),
        }),
      }),
    };

    await insertSeedData(db as never, await buildSeedData());
    expect(inserted).toEqual(SEED_INSERTION_ORDER);
  });
});

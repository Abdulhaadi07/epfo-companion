import { describe, expect, it } from "vitest";
import { claimEvents, claims, employmentRecords, pfAccounts, users } from "./schema";
import { insertSeedData, SEED_INSERTION_ORDER } from "./seed";
import { buildSeedData, SYNTHETIC_CLAIM_IDS } from "./seed-data";

const tableNames = new Map<unknown, string>([
  [users, "users"],
  [employmentRecords, "employmentRecords"],
  [pfAccounts, "pfAccounts"],
  [claims, "claims"],
  [claimEvents, "claimEvents"],
]);

describe("synthetic seed persistence", () => {
  it("declares and executes foreign-key-safe insertion order", async () => {
    expect(SEED_INSERTION_ORDER).toEqual(["users", "employmentRecords", "pfAccounts", "claims", "claimEvents"]);
    const persisted: string[] = [];
    const deletedClaimIds: string[] = [];
    let transactionCalls = 0;
    const db = {
      transaction: async (callback: (tx: unknown) => Promise<void>) => {
        transactionCalls += 1;
        return callback({
          insert: (table: unknown) => ({
            values: () => {
              const tableName = tableNames.get(table) ?? "unknown";
              if (tableName === "claimEvents") {
                return Promise.resolve().then(() => {
                  persisted.push("claimEvents");
                });
              }
              return {
                onConflictDoUpdate: async () => {
                  persisted.push(tableName);
                },
              };
            },
          }),
          delete: (table: unknown) => ({
            where: async () => {
              if (tableNames.get(table) === "claimEvents") {
                deletedClaimIds.push(...SYNTHETIC_CLAIM_IDS);
              }
            },
          }),
        });
      },
    };

    await insertSeedData(db as never, await buildSeedData());
    expect(transactionCalls).toBe(1);
    expect(persisted).toEqual(["users", "employmentRecords", "pfAccounts", "claims", "claimEvents"]);
    expect(deletedClaimIds).toEqual(SYNTHETIC_CLAIM_IDS);
  });

  it("refreshes synthetic claim events on every seed run", async () => {
    const data = await buildSeedData();
    const storedEvents: typeof data.claimEvents = [];
    const db = {
      transaction: async (callback: (tx: unknown) => Promise<void>) => callback({
        insert: (table: unknown) => ({
          values: (rows: typeof data.claimEvents) => {
            const tableName = tableNames.get(table) ?? "unknown";
            if (tableName === "claimEvents") {
              return Promise.resolve().then(() => {
                storedEvents.splice(0, storedEvents.length, ...rows);
              });
            }
            return {
              onConflictDoUpdate: async () => undefined,
            };
          },
        }),
        delete: () => ({
          where: async () => {
            storedEvents.splice(0, storedEvents.length);
          },
        }),
      }),
    };

    await insertSeedData(db as never, data);
    expect(storedEvents).toEqual(data.claimEvents);

    const refreshed = await buildSeedData();
    refreshed.claimEvents[0] = {
      ...refreshed.claimEvents[0],
      metadata: { refreshed: true },
    };

    await insertSeedData(db as never, refreshed);
    expect(storedEvents).toEqual(refreshed.claimEvents);
    expect(storedEvents[0].metadata).toEqual({ refreshed: true });
  });
});

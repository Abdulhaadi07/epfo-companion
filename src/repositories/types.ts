import type { Database } from "@/db/client";
import type { TransactionalDatabase } from "@/db/transaction-client";
import type { claimEvents, claims, employmentRecords, pfAccounts, users } from "@/db/schema";

export type TransactionClient = Parameters<Parameters<TransactionalDatabase["transaction"]>[0]>[0];
export type RepositoryDatabase = Database | TransactionalDatabase | TransactionClient;

export type UserRecord = typeof users.$inferSelect;
export type EmploymentRecord = typeof employmentRecords.$inferSelect;
export type PFAccountRecord = typeof pfAccounts.$inferSelect;
export type ClaimRecord = typeof claims.$inferSelect;
export type ClaimEventRecord = typeof claimEvents.$inferSelect;

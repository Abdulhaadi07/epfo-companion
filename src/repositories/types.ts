import type { Database } from "@/db";
import type { claimEvents, claims, employmentRecords, pfAccounts, users } from "@/db/schema";

export type UserRecord = typeof users.$inferSelect;
export type EmploymentRecord = typeof employmentRecords.$inferSelect;
export type PFAccountRecord = typeof pfAccounts.$inferSelect;
export type ClaimRecord = typeof claims.$inferSelect;
export type ClaimEventRecord = typeof claimEvents.$inferSelect;
export type RepositoryDatabase = Database;

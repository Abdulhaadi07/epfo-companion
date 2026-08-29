import { CLAIM_REASON_CODES, CLAIM_STATUSES, type ClaimDomainEvent } from "../domain/claims";
import { pgEnum, pgTable, text, bigint, jsonb, timestamp, date, index, uniqueIndex } from "drizzle-orm/pg-core";

export const claimStatusEnum = pgEnum("claim_status", CLAIM_STATUSES);
export const claimReasonCodeEnum = pgEnum("claim_reason_code", CLAIM_REASON_CODES);
export const claimEventTypes = [
  "CLAIM_MARKED_READY", "CLAIM_SUBMITTED", "VERIFICATION_STARTED", "ACTION_REQUIRED",
  "CLAIM_REJECTED", "CLAIM_RESOLVED", "CLAIM_RESUBMITTED", "CLAIM_APPROVED",
  "SETTLEMENT_STARTED", "SETTLEMENT_COMPLETED",
] as const satisfies readonly ClaimDomainEvent["type"][];
export const claimEventTypeEnum = pgEnum("claim_event_type", claimEventTypes);
export const claimTypes = ["FINAL_SETTLEMENT"] as const;
export const claimTypeEnum = pgEnum("claim_type", claimTypes);
export const READINESS_STATUSES = [
  "READY",
  "UNDER_VERIFICATION",
  "ACTION_REQUIRED",
  "REJECTED",
] as const;
export type ReadinessStatus = (typeof READINESS_STATUSES)[number];
export const readinessStatusEnum = pgEnum("readiness_status", READINESS_STATUSES);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  uan: text("uan").notNull(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  identityStatus: readinessStatusEnum("identity_status").notNull(),
  preferredLanguage: text("preferred_language").notNull(),
  preferredRegion: text("preferred_region").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("users_uan_unique").on(table.uan)]);

export const employmentRecords = pgTable("employment_records", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  employerName: text("employer_name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  ...timestamps,
}, (table) => [index("employment_records_user_id_idx").on(table.userId)]);

export const pfAccounts = pgTable("pf_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  employmentId: text("employment_id").notNull().references(() => employmentRecords.id, { onDelete: "restrict" }),
  syntheticMemberId: text("synthetic_member_id").notNull(),
  balanceInPaise: bigint("balance_in_paise", { mode: "number" }).notNull(),
  bankDisplayName: text("bank_display_name").notNull(),
  bankStatus: readinessStatusEnum("bank_status").notNull(),
  kycStatus: readinessStatusEnum("kyc_status").notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex("pf_accounts_member_id_unique").on(table.syntheticMemberId),
  index("pf_accounts_user_id_idx").on(table.userId),
  index("pf_accounts_employment_id_idx").on(table.employmentId),
]);

export const claims = pgTable("claims", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pfAccountId: text("pf_account_id").notNull().references(() => pfAccounts.id, { onDelete: "restrict" }),
  claimType: claimTypeEnum("claim_type").notNull(),
  currentStatus: claimStatusEnum("current_status").notNull(),
  reasonCodes: claimReasonCodeEnum("reason_codes").array().notNull().default([]),
  amountInPaise: bigint("amount_in_paise", { mode: "number" }).notNull(),
  ...timestamps,
}, (table) => [
  index("claims_user_id_idx").on(table.userId),
  index("claims_pf_account_id_idx").on(table.pfAccountId),
  index("claims_status_idx").on(table.currentStatus),
]);

export const claimEvents = pgTable("claim_events", {
  id: text("id").primaryKey(),
  claimId: text("claim_id").notNull().references(() => claims.id, { onDelete: "cascade" }),
  eventType: claimEventTypeEnum("event_type").notNull(),
  reasonCode: claimReasonCodeEnum("reason_code"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
}, (table) => [index("claim_events_claim_id_occurred_at_idx").on(table.claimId, table.occurredAt)]);

export const schema = { users, employmentRecords, pfAccounts, claims, claimEvents };

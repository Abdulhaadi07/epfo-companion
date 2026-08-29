CREATE TYPE "public"."claim_event_type" AS ENUM('CLAIM_MARKED_READY', 'CLAIM_SUBMITTED', 'VERIFICATION_STARTED', 'ACTION_REQUIRED', 'CLAIM_REJECTED', 'CLAIM_RESOLVED', 'CLAIM_RESUBMITTED', 'CLAIM_APPROVED', 'SETTLEMENT_STARTED', 'SETTLEMENT_COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."claim_reason_code" AS ENUM('BANK_NAME_MISMATCH', 'BANK_NOT_VERIFIED', 'EXIT_DATE_MISSING', 'KYC_INCOMPLETE', 'IDENTITY_MISMATCH', 'DOCUMENT_REQUIRED', 'CLAIM_REJECTED');--> statement-breakpoint
CREATE TYPE "public"."claim_status" AS ENUM('DRAFT', 'READY', 'SUBMITTED', 'UNDER_VERIFICATION', 'ACTION_REQUIRED', 'REJECTED', 'RESOLUTION', 'RESUBMITTED', 'APPROVED', 'SETTLEMENT', 'SETTLED');--> statement-breakpoint
CREATE TYPE "public"."claim_type" AS ENUM('FINAL_SETTLEMENT');--> statement-breakpoint
CREATE TYPE "public"."readiness_status" AS ENUM('READY', 'UNDER_VERIFICATION', 'ACTION_REQUIRED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "claim_events" (
	"id" text PRIMARY KEY NOT NULL,
	"claim_id" text NOT NULL,
	"event_type" "claim_event_type" NOT NULL,
	"reason_code" "claim_reason_code",
	"occurred_at" timestamp with time zone NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"pf_account_id" text NOT NULL,
	"claim_type" "claim_type" NOT NULL,
	"current_status" "claim_status" NOT NULL,
	"reason_codes" "claim_reason_code"[] DEFAULT '{}' NOT NULL,
	"amount_in_paise" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employment_records" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"employer_name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pf_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"employment_id" text NOT NULL,
	"synthetic_member_id" text NOT NULL,
	"balance_in_paise" bigint NOT NULL,
	"bank_display_name" text NOT NULL,
	"bank_status" "readiness_status" NOT NULL,
	"kyc_status" "readiness_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"login_id" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text NOT NULL,
	"identity_status" "readiness_status" NOT NULL,
	"preferred_language" text NOT NULL,
	"preferred_region" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "claim_events" ADD CONSTRAINT "claim_events_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_pf_account_id_pf_accounts_id_fk" FOREIGN KEY ("pf_account_id") REFERENCES "public"."pf_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_records" ADD CONSTRAINT "employment_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pf_accounts" ADD CONSTRAINT "pf_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pf_accounts" ADD CONSTRAINT "pf_accounts_employment_id_employment_records_id_fk" FOREIGN KEY ("employment_id") REFERENCES "public"."employment_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "claim_events_claim_id_occurred_at_idx" ON "claim_events" USING btree ("claim_id","occurred_at");--> statement-breakpoint
CREATE INDEX "claims_user_id_idx" ON "claims" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "claims_pf_account_id_idx" ON "claims" USING btree ("pf_account_id");--> statement-breakpoint
CREATE INDEX "claims_status_idx" ON "claims" USING btree ("current_status");--> statement-breakpoint
CREATE INDEX "employment_records_user_id_idx" ON "employment_records" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pf_accounts_member_id_unique" ON "pf_accounts" USING btree ("synthetic_member_id");--> statement-breakpoint
CREATE INDEX "pf_accounts_user_id_idx" ON "pf_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pf_accounts_employment_id_idx" ON "pf_accounts" USING btree ("employment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_login_id_unique" ON "users" USING btree ("login_id");
ALTER TABLE "users" RENAME COLUMN "login_id" TO "uan";--> statement-breakpoint
ALTER INDEX "users_login_id_unique" RENAME TO "users_uan_unique";

import { asc, eq } from "drizzle-orm";
import { claimEvents } from "@/db/schema";
import type { ClaimEventRecord, RepositoryDatabase } from "./types";

export type ClaimEventInsert = typeof claimEvents.$inferInsert;

export function createClaimEventRepository(db: RepositoryDatabase) {
  return {
    async findById(id: string): Promise<ClaimEventRecord | undefined> {
      const rows = await db.select().from(claimEvents).where(eq(claimEvents.id, id)).limit(1);
      return rows[0];
    },
    async listByClaimId(claimId: string): Promise<ClaimEventRecord[]> {
      return db.select().from(claimEvents).where(eq(claimEvents.claimId, claimId)).orderBy(asc(claimEvents.occurredAt));
    },
    async insert(event: ClaimEventInsert): Promise<void> {
      await db.insert(claimEvents).values(event);
    },
  };
}

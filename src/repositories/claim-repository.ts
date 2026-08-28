import { eq } from "drizzle-orm";
import { claims } from "@/db/schema";
import type { ClaimRecord, RepositoryDatabase } from "./types";

export function createClaimRepository(db: RepositoryDatabase) {
  return {
    async findById(id: string): Promise<ClaimRecord | undefined> {
      const rows = await db.select().from(claims).where(eq(claims.id, id)).limit(1);
      return rows[0];
    },
    async listByUserId(userId: string): Promise<ClaimRecord[]> { return db.select().from(claims).where(eq(claims.userId, userId)); },
  };
}

import { eq } from "drizzle-orm";
import { claims } from "@/db/schema";
import type { ClaimReasonCode, ClaimStatus } from "@/domain/claims";
import type { ClaimRecord, RepositoryDatabase } from "./types";

export type ClaimRecoveryStateUpdate = {
  currentStatus: ClaimStatus;
  reasonCodes: readonly ClaimReasonCode[];
  updatedAt: Date;
};

export function createClaimRepository(db: RepositoryDatabase) {
  return {
    async findById(id: string): Promise<ClaimRecord | undefined> {
      const rows = await db.select().from(claims).where(eq(claims.id, id)).limit(1);
      return rows[0];
    },
    async listByUserId(userId: string): Promise<ClaimRecord[]> { return db.select().from(claims).where(eq(claims.userId, userId)); },
    async updateRecoveryState(id: string, values: ClaimRecoveryStateUpdate): Promise<void> {
      await db
        .update(claims)
        .set({
          currentStatus: values.currentStatus,
          reasonCodes: [...values.reasonCodes],
          updatedAt: values.updatedAt,
        })
        .where(eq(claims.id, id));
    },
  };
}

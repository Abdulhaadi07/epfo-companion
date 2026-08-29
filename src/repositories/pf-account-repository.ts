import { eq } from "drizzle-orm";
import { pfAccounts, type ReadinessStatus } from "@/db/schema";
import type { PFAccountRecord, RepositoryDatabase } from "./types";

export function createPFAccountRepository(db: RepositoryDatabase) {
  return {
    async findById(id: string): Promise<PFAccountRecord | undefined> {
      const rows = await db.select().from(pfAccounts).where(eq(pfAccounts.id, id)).limit(1);
      return rows[0];
    },
    async listByUserId(userId: string): Promise<PFAccountRecord[]> { return db.select().from(pfAccounts).where(eq(pfAccounts.userId, userId)); },
    async updateBankCorrection(
      id: string,
      values: { bankDisplayName: string; bankStatus: ReadinessStatus },
    ): Promise<void> {
      await db
        .update(pfAccounts)
        .set({
          bankDisplayName: values.bankDisplayName,
          bankStatus: values.bankStatus,
          updatedAt: new Date(),
        })
        .where(eq(pfAccounts.id, id));
    },
    async updateKycStatus(id: string, kycStatus: ReadinessStatus): Promise<void> {
      await db
        .update(pfAccounts)
        .set({
          kycStatus,
          updatedAt: new Date(),
        })
        .where(eq(pfAccounts.id, id));
    },
    async updateBankStatus(id: string, bankStatus: ReadinessStatus): Promise<void> {
      await db
        .update(pfAccounts)
        .set({
          bankStatus,
          updatedAt: new Date(),
        })
        .where(eq(pfAccounts.id, id));
    },
  };
}

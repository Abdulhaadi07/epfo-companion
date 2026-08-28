import { eq } from "drizzle-orm";
import { pfAccounts } from "@/db/schema";
import type { PFAccountRecord, RepositoryDatabase } from "./types";

export function createPFAccountRepository(db: RepositoryDatabase) {
  return {
    async findById(id: string): Promise<PFAccountRecord | undefined> {
      const rows = await db.select().from(pfAccounts).where(eq(pfAccounts.id, id)).limit(1);
      return rows[0];
    },
    async listByUserId(userId: string): Promise<PFAccountRecord[]> { return db.select().from(pfAccounts).where(eq(pfAccounts.userId, userId)); },
  };
}

import { eq } from "drizzle-orm";
import { users, type ReadinessStatus } from "@/db/schema";
import type { RepositoryDatabase, UserRecord } from "./types";

export function createUserRepository(db: RepositoryDatabase) {
  return {
    async findById(id: string): Promise<UserRecord | undefined> {
      const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return rows[0];
    },
    async findByUan(uan: string): Promise<UserRecord | undefined> {
      const rows = await db.select().from(users).where(eq(users.uan, uan)).limit(1);
      return rows[0];
    },
    async list(): Promise<UserRecord[]> { return db.select().from(users); },
    async updateIdentityStatus(id: string, identityStatus: ReadinessStatus): Promise<void> {
      await db
        .update(users)
        .set({
          identityStatus,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));
    },
  };
}

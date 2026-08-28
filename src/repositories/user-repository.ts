import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import type { RepositoryDatabase, UserRecord } from "./types";

export function createUserRepository(db: RepositoryDatabase) {
  return {
    async findById(id: string): Promise<UserRecord | undefined> {
      const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return rows[0];
    },
    async findByLoginId(loginId: string): Promise<UserRecord | undefined> {
      const rows = await db.select().from(users).where(eq(users.loginId, loginId)).limit(1);
      return rows[0];
    },
    async list(): Promise<UserRecord[]> { return db.select().from(users); },
  };
}

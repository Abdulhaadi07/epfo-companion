import { eq } from "drizzle-orm";
import { employmentRecords } from "@/db/schema";
import type { EmploymentRecord, RepositoryDatabase } from "./types";

export function createEmploymentRepository(db: RepositoryDatabase) {
  return {
    async findById(id: string): Promise<EmploymentRecord | undefined> {
      const rows = await db.select().from(employmentRecords).where(eq(employmentRecords.id, id)).limit(1);
      return rows[0];
    },
    async listByUserId(userId: string): Promise<EmploymentRecord[]> { return db.select().from(employmentRecords).where(eq(employmentRecords.userId, userId)); },
    async updateEndDate(id: string, endDate: string): Promise<void> {
      await db
        .update(employmentRecords)
        .set({
          endDate,
          updatedAt: new Date(),
        })
        .where(eq(employmentRecords.id, id));
    },
  };
}

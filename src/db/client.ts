import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { schema } from "./schema";

export function createDatabase(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error("DATABASE_URL is required to connect to PostgreSQL.");
  return drizzle({ client: neon(connectionString), schema });
}

export type Database = ReturnType<typeof createDatabase>;

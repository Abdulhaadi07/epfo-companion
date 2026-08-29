import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import { drizzle } from "drizzle-orm/neon-serverless";
import { schema } from "./schema";

// Neon's Pool uses WebSockets for session and interactive transaction support.
// Keep this module on the Node/server side; it is not exported from the shared
// database index used by application code.
neonConfig.webSocketConstructor = ws;

export function createTransactionalDatabase(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error("DATABASE_URL is required to connect to PostgreSQL.");

  const pool = new Pool({ connectionString });
  return drizzle({ client: pool, schema });
}

export type TransactionalDatabase = ReturnType<typeof createTransactionalDatabase>;

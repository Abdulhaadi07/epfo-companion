import { compare } from "bcryptjs";
import { createDatabase } from "@/db/client";
import { parseUan } from "@/domain/auth/uan";
import { createUserRepository } from "@/repositories/user-repository";

export const AUTH_ERROR_MESSAGE = "Login details could not be verified.";

export type AuthenticateUserDeps = {
  findByUan: (uan: string) => Promise<{ id: string; passwordHash: string } | undefined>;
  comparePassword: (password: string, hash: string) => Promise<boolean>;
};

function createDefaultAuthDeps(): AuthenticateUserDeps {
  const db = createDatabase();
  const userRepository = createUserRepository(db);

  return {
    findByUan: (uan) => userRepository.findByUan(uan),
    comparePassword: compare,
  };
}

export async function authenticateUser(
  uan: string,
  password: string,
  deps: AuthenticateUserDeps = createDefaultAuthDeps(),
): Promise<string | null> {
  const normalizedUan = parseUan(uan);
  if (!normalizedUan || !password) return null;

  const user = await deps.findByUan(normalizedUan);
  if (!user) return null;

  const valid = await deps.comparePassword(password, user.passwordHash);
  if (!valid) return null;

  return user.id;
}

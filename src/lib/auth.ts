import { compare } from "bcryptjs";
import { createDatabase } from "@/db/client";
import { createUserRepository } from "@/repositories/user-repository";

export const AUTH_ERROR_MESSAGE = "Login details could not be verified.";

export type AuthenticateUserDeps = {
  findByLoginId: (loginId: string) => Promise<{ id: string; passwordHash: string } | undefined>;
  comparePassword: (password: string, hash: string) => Promise<boolean>;
};

function createDefaultAuthDeps(): AuthenticateUserDeps {
  const db = createDatabase();
  const userRepository = createUserRepository(db);

  return {
    findByLoginId: (loginId) => userRepository.findByLoginId(loginId),
    comparePassword: compare,
  };
}

export async function authenticateUser(
  loginId: string,
  password: string,
  deps: AuthenticateUserDeps = createDefaultAuthDeps(),
): Promise<string | null> {
  const normalizedLoginId = loginId.trim();
  if (!normalizedLoginId || !password) return null;

  const user = await deps.findByLoginId(normalizedLoginId);
  if (!user) return null;

  const valid = await deps.comparePassword(password, user.passwordHash);
  if (!valid) return null;

  return user.id;
}

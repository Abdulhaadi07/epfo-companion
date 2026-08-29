import { cache } from "react";
import { createDatabase } from "@/db/client";
import { createUserRepository } from "@/repositories";

export type AuthenticatedUserView = {
  id: string;
  displayName: string;
};

export type AuthenticatedUserDeps = {
  findUserById: (userId: string) => Promise<{ id: string; displayName: string } | undefined>;
};

function createDefaultAuthenticatedUserDeps(): AuthenticatedUserDeps {
  const db = createDatabase();
  const userRepository = createUserRepository(db);

  return {
    findUserById: async (userId) => {
      const user = await userRepository.findById(userId);
      if (!user) return undefined;
      return { id: user.id, displayName: user.displayName };
    },
  };
}

async function loadAuthenticatedUser(
  userId: string,
  deps: AuthenticatedUserDeps,
): Promise<AuthenticatedUserView | null> {
  const user = await deps.findUserById(userId);
  return user ?? null;
}

export const getAuthenticatedUser = cache((userId: string) =>
  loadAuthenticatedUser(userId, createDefaultAuthenticatedUserDeps()),
);

export async function getAuthenticatedUserForTests(
  userId: string,
  deps: AuthenticatedUserDeps,
): Promise<AuthenticatedUserView | null> {
  return loadAuthenticatedUser(userId, deps);
}

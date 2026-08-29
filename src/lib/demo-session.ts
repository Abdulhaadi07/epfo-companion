"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, SESSION_MAX_AGE_SECONDS, verifySessionToken, type UserSession } from "./session-token";

const SESSION_COOKIE = "epfo_demo_session";

export type { UserSession };

export async function getSession(): Promise<UserSession | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value ? verifySessionToken(value) : null;
}

export async function requireSession(): Promise<UserSession> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function redirectIfSession() {
  if (await getSession()) redirect("/home");
}

export async function createSession(userId: string) {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/home");
}

export async function signOutSession() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}

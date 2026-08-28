"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoScenarioId, type DemoScenarioId } from "../domain/demo";

const SESSION_COOKIE = "epfo_demo_session";
const DEMO_CITIZEN_ID = "demo-citizen-001";
const DEFAULT_SCENARIO: DemoScenarioId = "UNDER_VERIFICATION";
const SESSION_MAX_AGE = 60 * 60 * 8;

export type DemoSession = {
  citizenId: typeof DEMO_CITIZEN_ID;
  scenarioId: DemoScenarioId;
};

const DEFAULT_DEMO_SESSION: DemoSession = {
  citizenId: DEMO_CITIZEN_ID,
  scenarioId: DEFAULT_SCENARIO,
};

function encodeSession(session: DemoSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(value: string): DemoSession | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Record<string, unknown>;
    if (candidate.citizenId !== DEMO_CITIZEN_ID || typeof candidate.scenarioId !== "string" || !isDemoScenarioId(candidate.scenarioId)) return null;
    return { citizenId: DEMO_CITIZEN_ID, scenarioId: candidate.scenarioId };
  } catch {
    return null;
  }
}

export async function getDemoSession(): Promise<DemoSession | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value ? decodeSession(value) : null;
}

export async function requireDemoSession(): Promise<DemoSession> {
  const session = await getDemoSession();
  if (!session) redirect("/login");
  return session;
}

export async function redirectIfDemoSession() {
  if (await getDemoSession()) redirect("/home");
}

export async function enterDemoSession() {
  (await cookies()).set(SESSION_COOKIE, encodeSession(DEFAULT_DEMO_SESSION), {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/home");
}

export async function signOutDemoSession() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}

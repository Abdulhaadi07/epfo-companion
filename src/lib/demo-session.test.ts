import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = {
  value: undefined as string | undefined,
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({ cookies: vi.fn(async () => cookieStore) }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { redirect } from "next/navigation";
import { AUTHENTICATED_NAVIGATION, getNavigation } from "../components/layout/navigation";
import { createSession, getSession, redirectIfSession, requireSession, signOutSession, type UserSession } from "./demo-session";
import { createSessionToken } from "./session-token";

const TEST_SECRET = "test-session-secret";
const NOW = 1_700_000_000;
const USER_SESSION: UserSession = { userId: "synthetic-user-under_verification" };

function signedSession(userId = USER_SESSION.userId, now = NOW) {
  return createSessionToken(userId, { secret: TEST_SECRET, now });
}

describe("user session behavior", () => {
  beforeEach(() => {
    process.env.AUTH_SESSION_SECRET = TEST_SECRET;
    vi.spyOn(Date, "now").mockReturnValue(NOW * 1000);
    cookieStore.value = undefined;
    cookieStore.get.mockImplementation(() => cookieStore.value ? { value: cookieStore.value } : undefined);
    cookieStore.set.mockClear();
    cookieStore.delete.mockClear();
    vi.mocked(redirect).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirects unauthenticated access away from /home", async () => {
    await requireSession();
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("allows authenticated access to /home", async () => {
    cookieStore.value = signedSession();
    await expect(requireSession()).resolves.toEqual(USER_SESSION);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("stores the authenticated user identity in a signed session", async () => {
    cookieStore.value = signedSession();
    await expect(getSession()).resolves.toEqual(USER_SESSION);
  });

  it("rejects a tampered session cookie", async () => {
    const token = signedSession();
    cookieStore.value = `${token}tampered`;
    await expect(getSession()).resolves.toBeNull();
  });

  it("rejects a malformed session cookie", async () => {
    cookieStore.value = Buffer.from(JSON.stringify(USER_SESSION), "utf8").toString("base64url");
    await expect(getSession()).resolves.toBeNull();
  });

  it("rejects an expired session cookie", async () => {
    cookieStore.value = createSessionToken(USER_SESSION.userId, {
      secret: TEST_SECRET,
      now: NOW - 60 * 60 * 8 - 1,
      maxAgeSeconds: 60 * 60 * 8,
    });
    await expect(getSession()).resolves.toBeNull();
  });

  it("redirects an existing session away from login", async () => {
    cookieStore.value = signedSession();
    await redirectIfSession();
    expect(redirect).toHaveBeenCalledWith("/home");
  });

  it("creates a signed user-centric session cookie", async () => {
    await createSession(USER_SESSION.userId);
    const [name, value] = cookieStore.set.mock.calls[0] as [string, string, Record<string, unknown>];
    expect(name).toBe("epfo_demo_session");
    expect(value.split(".")).toHaveLength(2);
    expect(cookieStore.set.mock.calls[0][2]).toMatchObject({ httpOnly: true, sameSite: "lax", secure: false, maxAge: 60 * 60 * 8 });
    expect(redirect).toHaveBeenCalledWith("/home");
  });

  it("signs out by deleting the session and returning public", async () => {
    await signOutSession();
    expect(cookieStore.delete).toHaveBeenCalledWith("epfo_demo_session");
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("uses authenticated navigation without a sign-in action", () => {
    const navigation = getNavigation(true);
    expect(navigation).toEqual(AUTHENTICATED_NAVIGATION);
    expect(navigation.map((item) => item.label)).not.toContain("Sign in");
    expect(navigation.map((item) => item.label)).toContain("My Claims");
  });
});

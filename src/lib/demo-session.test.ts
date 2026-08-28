import { beforeEach, describe, expect, it, vi } from "vitest";

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
import { enterDemoSession, redirectIfDemoSession, requireDemoSession, signOutDemoSession, type DemoSession } from "./demo-session";

const DEFAULT_DEMO_SESSION: DemoSession = { citizenId: "demo-citizen-001", scenarioId: "UNDER_VERIFICATION" };

function encoded(session: typeof DEFAULT_DEMO_SESSION) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

describe("demo session behavior", () => {
  beforeEach(() => {
    cookieStore.value = undefined;
    cookieStore.get.mockImplementation(() => cookieStore.value ? { value: cookieStore.value } : undefined);
    cookieStore.set.mockClear();
    cookieStore.delete.mockClear();
    vi.mocked(redirect).mockClear();
  });

  it("redirects logged-out access to the citizen home guard", async () => {
    await requireDemoSession();
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("allows logged-in access to the citizen home guard", async () => {
    cookieStore.value = encoded(DEFAULT_DEMO_SESSION);
    await expect(requireDemoSession()).resolves.toEqual(DEFAULT_DEMO_SESSION);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects an existing session away from login", async () => {
    cookieStore.value = encoded(DEFAULT_DEMO_SESSION);
    await redirectIfDemoSession();
    expect(redirect).toHaveBeenCalledWith("/home");
  });

  it("creates the default under-verification session", async () => {
    await enterDemoSession();
    const [name, value] = cookieStore.set.mock.calls[0] as [string, string, Record<string, unknown>];
    expect(name).toBe("epfo_demo_session");
    expect(JSON.parse(Buffer.from(value, "base64url").toString("utf8"))).toEqual(DEFAULT_DEMO_SESSION);
    expect(cookieStore.set.mock.calls[0][2]).toMatchObject({ httpOnly: true, sameSite: "lax", secure: false });
    expect(redirect).toHaveBeenCalledWith("/home");
  });

  it("signs out by deleting the session and returning public", async () => {
    await signOutDemoSession();
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

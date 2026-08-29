import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectError = new Error("NEXT_REDIRECT");

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw redirectError;
  }),
}));
vi.mock("./auth", () => ({ authenticateUser: vi.fn() }));
vi.mock("./demo-session", () => ({ createSession: vi.fn() }));

import { redirect } from "next/navigation";
import { loginAction, loginSampleAccountAction } from "./auth-actions";
import { authenticateUser } from "./auth";
import { createSession } from "./demo-session";
import { DEFAULT_SAMPLE_ACCOUNT, SAMPLE_ACCOUNT_PASSWORD } from "./sample-accounts";

describe("auth actions", () => {
  beforeEach(() => {
    vi.mocked(redirect).mockClear();
    vi.mocked(authenticateUser).mockReset();
    vi.mocked(createSession).mockReset();
  });

  it("creates a session after valid login", async () => {
    vi.mocked(authenticateUser).mockResolvedValue("synthetic-user-ready");

    const formData = new FormData();
    formData.set("loginId", "sample-ready");
    formData.set("password", SAMPLE_ACCOUNT_PASSWORD);

    await loginAction(formData);

    expect(authenticateUser).toHaveBeenCalledWith("sample-ready", SAMPLE_ACCOUNT_PASSWORD);
    expect(createSession).toHaveBeenCalledWith("synthetic-user-ready");
  });

  it("redirects back to login for invalid credentials", async () => {
    vi.mocked(authenticateUser).mockResolvedValue(null);

    const formData = new FormData();
    formData.set("loginId", "sample-ready");
    formData.set("password", "wrong-password");

    await expect(loginAction(formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(redirect).toHaveBeenCalledWith("/login?error=auth");
    expect(createSession).not.toHaveBeenCalled();
  });

  it("redirects back to login for malformed form data", async () => {
    const formData = new FormData();
    formData.set("loginId", "sample-ready");

    await expect(loginAction(formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(redirect).toHaveBeenCalledWith("/login?error=auth");
    expect(authenticateUser).not.toHaveBeenCalled();
  });

  it("authenticates the default sample account without bypassing login", async () => {
    vi.mocked(authenticateUser).mockResolvedValue("synthetic-user-under_verification");

    await loginSampleAccountAction();

    expect(authenticateUser).toHaveBeenCalledWith(DEFAULT_SAMPLE_ACCOUNT.loginId, SAMPLE_ACCOUNT_PASSWORD);
    expect(createSession).toHaveBeenCalledWith("synthetic-user-under_verification");
  });
});

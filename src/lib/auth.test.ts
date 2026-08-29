import { describe, expect, it, vi } from "vitest";
import { AUTH_ERROR_MESSAGE, authenticateUser } from "./auth";

describe("authenticateUser", () => {
  it("returns the user id for valid credentials", async () => {
    const userId = await authenticateUser("sample-ready", "sample-password", {
      findByLoginId: vi.fn(async () => ({ id: "synthetic-user-ready", passwordHash: "hashed" })),
      comparePassword: vi.fn(async () => true),
    });

    expect(userId).toBe("synthetic-user-ready");
  });

  it("returns null for an unknown login id", async () => {
    const userId = await authenticateUser("missing-user", "sample-password", {
      findByLoginId: vi.fn(async () => undefined),
      comparePassword: vi.fn(async () => true),
    });

    expect(userId).toBeNull();
  });

  it("returns null for an incorrect password", async () => {
    const userId = await authenticateUser("sample-ready", "wrong-password", {
      findByLoginId: vi.fn(async () => ({ id: "synthetic-user-ready", passwordHash: "hashed" })),
      comparePassword: vi.fn(async () => false),
    });

    expect(userId).toBeNull();
  });

  it("returns null for blank credentials", async () => {
    const findByLoginId = vi.fn();
    const userId = await authenticateUser("   ", "sample-password", {
      findByLoginId,
      comparePassword: vi.fn(async () => true),
    });

    expect(userId).toBeNull();
    expect(findByLoginId).not.toHaveBeenCalled();
  });

  it("exposes a generic authentication error message", () => {
    expect(AUTH_ERROR_MESSAGE).toBe("Login details could not be verified.");
  });
});

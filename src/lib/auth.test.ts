import { describe, expect, it, vi } from "vitest";
import { AUTH_ERROR_MESSAGE, authenticateUser } from "./auth";

describe("authenticateUser", () => {
  it("returns the user id for valid credentials", async () => {
    const userId = await authenticateUser("100000000001", "sample-password", {
      findByUan: vi.fn(async () => ({ id: "synthetic-user-ready", passwordHash: "hashed" })),
      comparePassword: vi.fn(async () => true),
    });

    expect(userId).toBe("synthetic-user-ready");
  });

  it("returns null for an unknown UAN", async () => {
    const userId = await authenticateUser("100000000099", "sample-password", {
      findByUan: vi.fn(async () => undefined),
      comparePassword: vi.fn(async () => true),
    });

    expect(userId).toBeNull();
  });

  it("returns null for an incorrect password", async () => {
    const userId = await authenticateUser("100000000001", "wrong-password", {
      findByUan: vi.fn(async () => ({ id: "synthetic-user-ready", passwordHash: "hashed" })),
      comparePassword: vi.fn(async () => false),
    });

    expect(userId).toBeNull();
  });

  it("returns null for blank credentials", async () => {
    const findByUan = vi.fn();
    const userId = await authenticateUser("   ", "sample-password", {
      findByUan,
      comparePassword: vi.fn(async () => true),
    });

    expect(userId).toBeNull();
    expect(findByUan).not.toHaveBeenCalled();
  });

  it("returns null for an invalid UAN format", async () => {
    const findByUan = vi.fn();
    const userId = await authenticateUser("sample-ready", "sample-password", {
      findByUan,
      comparePassword: vi.fn(async () => true),
    });

    expect(userId).toBeNull();
    expect(findByUan).not.toHaveBeenCalled();
  });

  it("exposes a generic authentication error message", () => {
    expect(AUTH_ERROR_MESSAGE).toBe("Login details could not be verified.");
  });
});

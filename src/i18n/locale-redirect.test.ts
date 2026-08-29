import { describe, expect, it } from "vitest";
import { buildReturnUrl, sanitizeReturnPath } from "./locale-redirect";

describe("locale redirect helpers", () => {
  it("preserves the current pathname for valid relative paths", () => {
    expect(sanitizeReturnPath("/home")).toBe("/home");
    expect(sanitizeReturnPath("/claim/status")).toBe("/claim/status");
  });

  it("rejects unsafe return paths", () => {
    expect(sanitizeReturnPath("//evil.example")).toBe("/");
    expect(sanitizeReturnPath("https://evil.example")).toBe("/");
    expect(sanitizeReturnPath(undefined)).toBe("/");
  });

  it("preserves the query string when present", () => {
    expect(buildReturnUrl("/login", "error=auth")).toBe("/login?error=auth");
    expect(buildReturnUrl("/login", "?error=auth")).toBe("/login?error=auth");
  });

  it("returns the pathname when the query string is empty", () => {
    expect(buildReturnUrl("/help", "")).toBe("/help");
    expect(buildReturnUrl("/help", undefined)).toBe("/help");
  });
});
